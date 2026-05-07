'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceRecorderState = 'idle' | 'requesting_permission' | 'recording' | 'stopping' | 'error';

export type VoiceRecorderError = 'permission_denied' | 'no_device' | 'unsupported' | 'aborted' | 'unknown';

export interface UseVoiceRecorderOptions {
  maxDurationMs?: number;
  onAutoStop?: () => void;
}

export interface VoiceRecorderResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export interface UseVoiceRecorderReturn {
  state: VoiceRecorderState;
  errorCode: VoiceRecorderError | null;
  audioLevel: number;
  elapsedMs: number;
  start: () => Promise<void>;
  stop: () => Promise<VoiceRecorderResult | null>;
  cancel: () => void;
  isSupported: boolean;
}

const PREFERRED_MIMES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mpeg'];

const detectIsSupported = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!navigator?.mediaDevices?.getUserMedia) {
    return false;
  }
  if (typeof window.MediaRecorder === 'undefined') {
    return false;
  }
  return true;
};

const pickSupportedMime = (): string => {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return '';
  }
  for (const candidate of PREFERRED_MIMES) {
    if (window.MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return '';
};

const mapMediaError = (ex: unknown): VoiceRecorderError => {
  if (typeof DOMException !== 'undefined' && ex instanceof DOMException) {
    if (ex.name === 'NotAllowedError' || ex.name === 'SecurityError') {
      return 'permission_denied';
    }
    if (ex.name === 'NotFoundError' || ex.name === 'OverconstrainedError') {
      return 'no_device';
    }
    if (ex.name === 'NotSupportedError') {
      return 'unsupported';
    }
    if (ex.name === 'AbortError') {
      return 'aborted';
    }
  }
  return 'unknown';
};

const computeRms = (buffer: Uint8Array): number => {
  if (buffer.length === 0) {
    return 0;
  }
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const normalized = (buffer[i] - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const rms = Math.sqrt(sumSquares / buffer.length);
  return Math.max(0, Math.min(1, rms * 2.5));
};

export const useVoiceRecorder = (options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn => {
  const maxDurationMs = options.maxDurationMs ?? 60_000;
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [errorCode, setErrorCode] = useState<VoiceRecorderError | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(detectIsSupported());
  }, []);

  const stateRef = useRef<VoiceRecorderState>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const lastLevelRef = useRef<number>(0);
  const onAutoStopRef = useRef<(() => void) | null>(options.onAutoStop ?? null);
  const stopResolverRef = useRef<((value: VoiceRecorderResult | null) => void) | null>(null);
  const cancelledRef = useRef<boolean>(false);

  useEffect(() => {
    onAutoStopRef.current = options.onAutoStop ?? null;
  }, [options.onAutoStop]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      sourceNodeRef.current?.disconnect();
    } catch {
      /* noop */
    }
    sourceNodeRef.current = null;
    analyserRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((x) => x.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const stop = useCallback(async (): Promise<VoiceRecorderResult | null> => {
    if (stateRef.current !== 'recording') {
      return null;
    }
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      cleanup();
      setState('idle');
      return null;
    }
    cancelledRef.current = false;
    setState('stopping');
    return new Promise<VoiceRecorderResult | null>((resolve) => {
      stopResolverRef.current = resolve;
      try {
        recorder.stop();
      } catch {
        stopResolverRef.current = null;
        cleanup();
        setState('idle');
        resolve(null);
      }
    });
  }, [cleanup]);

  const cancel = useCallback(() => {
    if (stateRef.current === 'idle') {
      return;
    }
    cancelledRef.current = true;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        /* ignored */
      }
    }
    cleanup();
    setState('idle');
    setAudioLevel(0);
    setElapsedMs(0);
    stopResolverRef.current?.(null);
    stopResolverRef.current = null;
  }, [cleanup]);

  const tickRaf = useCallback(() => {
    if (stateRef.current !== 'recording') {
      return;
    }
    const elapsed = Date.now() - startedAtRef.current;
    setElapsedMs(elapsed);
    const analyser = analyserRef.current;
    if (analyser) {
      const bufferLength = analyser.fftSize;
      const buffer = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(buffer);
      const level = computeRms(buffer);
      if (Math.abs(level - lastLevelRef.current) > 0.05) {
        lastLevelRef.current = level;
        setAudioLevel(level);
      }
    }
    if (elapsed >= maxDurationMs) {
      onAutoStopRef.current?.();
      void stop();
      return;
    }
    rafRef.current = requestAnimationFrame(tickRaf);
  }, [maxDurationMs, stop]);

  const start = useCallback(async (): Promise<void> => {
    if (stateRef.current !== 'idle') {
      return;
    }
    if (!detectIsSupported()) {
      setErrorCode('unsupported');
      setState('error');
      return;
    }

    setErrorCode(null);
    setAudioLevel(0);
    setElapsedMs(0);
    setState('requesting_permission');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (ex) {
      console.error('[useVoiceRecorder] getUserMedia failed:', ex);
      setErrorCode(mapMediaError(ex));
      setState('error');
      return;
    }

    const chosenMime = pickSupportedMime();
    let recorder: MediaRecorder | null = null;
    let constructorError: unknown = null;
    if (chosenMime) {
      try {
        recorder = new MediaRecorder(stream, { mimeType: chosenMime });
      } catch (ex) {
        console.warn(`[useVoiceRecorder] MediaRecorder ctor failed for mime=${chosenMime}, retrying without mime:`, ex);
        constructorError = ex;
      }
    }
    if (!recorder) {
      try {
        recorder = new MediaRecorder(stream);
      } catch (ex) {
        console.error('[useVoiceRecorder] MediaRecorder ctor failed without mime:', ex);
        stream.getTracks().forEach((x) => x.stop());
        setErrorCode(mapMediaError(constructorError ?? ex));
        setState('error');
        return;
      }
    }

    streamRef.current = stream;
    recorderRef.current = recorder;
    chunksRef.current = [];
    cancelledRef.current = false;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const wasCancelled = cancelledRef.current;
      const finalMime = recorder.mimeType || chosenMime || 'audio/webm';
      const durationMs = Math.max(0, Date.now() - startedAtRef.current);
      const blob = new Blob(chunksRef.current, { type: finalMime });
      cleanup();
      setAudioLevel(0);
      setElapsedMs(0);
      setState('idle');
      const resolver = stopResolverRef.current;
      stopResolverRef.current = null;
      if (!resolver) {
        return;
      }
      if (wasCancelled || blob.size === 0) {
        resolver(null);
        return;
      }
      resolver({ blob, mimeType: finalMime, durationMs });
    };

    recorder.onerror = () => {
      setErrorCode('unknown');
      cleanup();
      setState('error');
      stopResolverRef.current?.(null);
      stopResolverRef.current = null;
    };

    try {
      const AudioContextCtor =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextCtor) {
        const audioContext = new AudioContextCtor();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        sourceNodeRef.current = source;
        analyserRef.current = analyser;
      }
    } catch {
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    startedAtRef.current = Date.now();
    try {
      recorder.start();
    } catch (ex) {
      console.error('[useVoiceRecorder] recorder.start failed:', ex);
      setErrorCode(mapMediaError(ex));
      cleanup();
      setState('error');
      return;
    }
    setState('recording');
    rafRef.current = requestAnimationFrame(tickRaf);
  }, [cleanup, tickRaf]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          /* noop */
        }
      }
      cleanup();
      stopResolverRef.current?.(null);
      stopResolverRef.current = null;
    };
  }, [cleanup]);

  return {
    state,
    errorCode,
    audioLevel,
    elapsedMs,
    start,
    stop,
    cancel,
    isSupported,
  };
};
