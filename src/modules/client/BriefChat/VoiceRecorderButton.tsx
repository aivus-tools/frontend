'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, Tooltip } from 'antd';
import { AudioOutlined, CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useVoiceRecorder, VoiceRecorderError, VoiceRecorderResult } from '@/hooks/useVoiceRecorder';
import { useTranscribeBriefAiMutation } from '@/services/client/briefAiApi';
import { useTranscribePublicBriefMutation } from '@/services/client/publicBriefApi';

import styles from './VoiceRecorderButton.module.css';

interface VoiceRecorderButtonProps {
  briefId: string | null;
  isPublic: boolean;
  publicToken: string | null;
  disabled: boolean;
  onTranscript: (text: string) => void;
  onBusyChange?: (busy: boolean) => void;
  onEnsureBrief?: () => Promise<{ briefId: string; token: string | null } | null>;
  compact?: boolean;
}

const WAVE_BARS = 16;
const MAX_DURATION_MS = 60_000;

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

type I18nKey = Parameters<typeof t>[0];

const errorToI18nKey = (code: VoiceRecorderError | null): I18nKey => {
  if (code === 'permission_denied') {
    return 'BRIEF_V3_VOICE_PERMISSION_DENIED';
  }
  if (code === 'no_device') {
    return 'BRIEF_V3_VOICE_NO_DEVICE';
  }
  if (code === 'unsupported') {
    return 'BRIEF_V3_VOICE_UNSUPPORTED';
  }
  return 'BRIEF_V3_VOICE_TRANSCRIBE_FAILED';
};

const apiErrorToI18nKey = (code: string | undefined): I18nKey => {
  if (code === 'NO_SPEECH_DETECTED') {
    return 'BRIEF_V3_VOICE_NO_SPEECH';
  }
  if (code === 'AUDIO_TOO_LARGE') {
    return 'BRIEF_V3_VOICE_AUDIO_TOO_LARGE';
  }
  if (code === 'AUDIO_TOO_LONG') {
    return 'BRIEF_V3_VOICE_AUDIO_TOO_LONG';
  }
  if (code === 'QUOTA_EXCEEDED') {
    return 'BRIEF_V3_VOICE_QUOTA';
  }
  if (code === 'UNSUPPORTED_FORMAT') {
    return 'BRIEF_V3_VOICE_UNSUPPORTED';
  }
  return 'BRIEF_V3_VOICE_TRANSCRIBE_FAILED';
};

type ButtonVariant = 'idle' | 'recording' | 'processing' | 'error';

const variantClass = (variant: ButtonVariant, compact: boolean | undefined): string => {
  const classes = [styles.voiceButton];
  if (compact) {
    classes.push(styles.voiceButtonCompact);
  }
  if (variant === 'recording') {
    classes.push(styles.voiceButtonRecording);
  } else if (variant === 'processing') {
    classes.push(styles.voiceButtonProcessing);
  } else if (variant === 'error') {
    classes.push(styles.voiceButtonError);
  }
  return classes.join(' ');
};

export const VoiceRecorderButton = (props: VoiceRecorderButtonProps) => {
  const { message: messageApi } = App.useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [waveSamples, setWaveSamples] = useState<number[]>(() => Array(WAVE_BARS).fill(0));
  const sampleBufferRef = useRef<number[]>(Array(WAVE_BARS).fill(0));
  const briefContextRef = useRef<{ briefId: string | null; token: string | null }>({
    briefId: props.briefId,
    token: props.publicToken,
  });
  const ensureDraftPromiseRef = useRef<Promise<{ briefId: string; token: string | null } | null> | null>(null);

  useEffect(() => {
    briefContextRef.current = { briefId: props.briefId, token: props.publicToken };
  }, [props.briefId, props.publicToken]);

  const [transcribeAuth] = useTranscribeBriefAiMutation();
  const [transcribePublic] = useTranscribePublicBriefMutation();

  const callTranscribe = useCallback(
    async (blob: Blob, mimeType: string, durationMs: number) => {
      if (!briefContextRef.current.briefId && ensureDraftPromiseRef.current) {
        const ensured = await ensureDraftPromiseRef.current;
        if (ensured?.briefId) {
          briefContextRef.current = { briefId: ensured.briefId, token: ensured.token };
        }
      }
      const ctx = briefContextRef.current;
      if (!ctx.briefId) {
        messageApi.error(t('BRIEF_V3_VOICE_TRANSCRIBE_FAILED'));
        return;
      }
      setIsProcessing(true);
      try {
        // No language is sent: it would be the interface locale, not the spoken
        // language. The recognizer auto-detects (or uses the brief's frozen
        // language) so a first message dictated in any language transcribes right.
        const result = props.isPublic
          ? await transcribePublic({
              briefId: ctx.briefId,
              token: ctx.token ?? '',
              audio: blob,
              mimeType,
              durationMs,
            }).unwrap()
          : await transcribeAuth({
              briefId: ctx.briefId,
              audio: blob,
              mimeType,
              durationMs,
            }).unwrap();
        const text = (result?.text ?? '').trim();
        if (!text) {
          messageApi.warning(t('BRIEF_V3_VOICE_NO_SPEECH'));
          return;
        }
        props.onTranscript(text);
      } catch (ex) {
        const data = (ex as { data?: { code?: string } } | undefined)?.data;
        messageApi.error(t(apiErrorToI18nKey(data?.code)));
      } finally {
        setIsProcessing(false);
      }
    },
    [messageApi, props, transcribeAuth, transcribePublic]
  );

  const onAutoStop = useCallback(
    (result: VoiceRecorderResult | null) => {
      messageApi.warning(t('BRIEF_V3_VOICE_LIMIT_REACHED'));
      if (result && result.blob.size > 0) {
        void callTranscribe(result.blob, result.mimeType, result.durationMs);
      }
    },
    [messageApi, callTranscribe]
  );

  const recorder = useVoiceRecorder({ maxDurationMs: MAX_DURATION_MS, onAutoStop });

  useEffect(() => {
    if (recorder.state !== 'recording') {
      sampleBufferRef.current = Array(WAVE_BARS).fill(0);
      setWaveSamples(sampleBufferRef.current);
      return;
    }
    sampleBufferRef.current = [...sampleBufferRef.current.slice(1), recorder.audioLevel];
    setWaveSamples(sampleBufferRef.current);
  }, [recorder.audioLevel, recorder.elapsedMs, recorder.state]);

  const isRecording = recorder.state === 'recording' || recorder.state === 'stopping';
  const isBusy = isRecording || isProcessing;

  useEffect(() => {
    props.onBusyChange?.(isBusy);
  }, [isBusy, props]);

  useEffect(() => {
    if (recorder.state === 'error' && recorder.errorCode) {
      messageApi.error(t(errorToI18nKey(recorder.errorCode)));
    }
  }, [recorder.state, recorder.errorCode, messageApi]);

  const handleClick = useCallback(async () => {
    if (props.disabled || isProcessing) {
      return;
    }
    if (recorder.state === 'idle' || recorder.state === 'error') {
      // Start capture synchronously inside the user gesture: browsers (Safari/iOS
      // especially) only grant getUserMedia reliably within the click handler, so
      // awaiting a network round-trip first would make the first recording fail.
      // The draft is created in parallel and awaited later, before transcription.
      if (!briefContextRef.current.briefId) {
        if (!props.onEnsureBrief) {
          return;
        }
        if (!ensureDraftPromiseRef.current) {
          ensureDraftPromiseRef.current = props.onEnsureBrief();
        }
      }
      await recorder.start();
      return;
    }
    if (recorder.state === 'recording') {
      const result = await recorder.stop();
      if (result) {
        await callTranscribe(result.blob, result.mimeType, result.durationMs);
      }
    }
  }, [callTranscribe, isProcessing, props, recorder]);

  const handleStop = useCallback(async () => {
    if (recorder.state !== 'recording') {
      return;
    }
    const result = await recorder.stop();
    if (result) {
      await callTranscribe(result.blob, result.mimeType, result.durationMs);
    }
  }, [callTranscribe, recorder]);

  const handleCancel = useCallback(() => {
    recorder.cancel();
  }, [recorder]);

  const buttonVariant = useMemo<ButtonVariant>(() => {
    if (isProcessing) {
      return 'processing';
    }
    if (isRecording) {
      return 'recording';
    }
    if (recorder.state === 'error') {
      return 'error';
    }
    return 'idle';
  }, [isProcessing, isRecording, recorder.state]);

  if (!recorder.isSupported) {
    return null;
  }

  const remainingMs = Math.max(0, MAX_DURATION_MS - recorder.elapsedMs);

  if (props.compact && (isRecording || isProcessing)) {
    return (
      <div className={styles.voiceInlinePanel}>
        <span className={styles.voiceRecordingDot} />
        <span className={styles.voiceTimer} aria-live='polite'>
          {formatTime(remainingMs)}
        </span>
        <div className={styles.voiceWave}>
          {waveSamples.map((level, i) => {
            const heightPx = Math.max(4, Math.min(28, level * 28));
            return (
              <span
                key={i}
                className={styles.voiceWaveBar}
                style={{ '--wave-bar-height': `${heightPx}px` } as React.CSSProperties}
              />
            );
          })}
        </div>
        <button
          type='button'
          className={`${styles.voiceIconBtn} ${styles.voiceIconBtnCancel}`}
          onClick={handleCancel}
          disabled={isProcessing}
          aria-label={t('BRIEF_V3_VOICE_CANCEL')}
        >
          <CloseOutlined />
        </button>
        <button
          type='button'
          className={`${styles.voiceIconBtn} ${styles.voiceIconBtnSend}`}
          onClick={handleStop}
          disabled={isProcessing}
          aria-label={t('BRIEF_V3_VOICE_STOP')}
        >
          {isProcessing ? <LoadingOutlined /> : <CheckOutlined />}
        </button>
      </div>
    );
  }

  return (
    <>
      {!props.compact && recorder.state === 'recording' ? (
        <div className={styles.voicePanel}>
          <span className={styles.voiceRecordingDot} />
          <span className={styles.voiceTimer} aria-live='polite'>
            {formatTime(remainingMs)}
          </span>
          <div className={styles.voiceWave}>
            {waveSamples.map((level, i) => {
              const heightPx = Math.max(4, Math.min(28, level * 28));
              return (
                <span
                  key={i}
                  className={styles.voiceWaveBar}
                  style={{ '--wave-bar-height': `${heightPx}px` } as React.CSSProperties}
                />
              );
            })}
          </div>
          <button
            type='button'
            className={`${styles.voiceIconBtn} ${styles.voiceIconBtnCancel}`}
            onClick={handleCancel}
            aria-label={t('BRIEF_V3_VOICE_CANCEL')}
          >
            <CloseOutlined />
          </button>
          <button
            type='button'
            className={`${styles.voiceIconBtn} ${styles.voiceIconBtnSend}`}
            onClick={handleStop}
            aria-label={t('BRIEF_V3_VOICE_STOP')}
          >
            <CheckOutlined />
          </button>
        </div>
      ) : null}

      <Tooltip
        title={
          isProcessing
            ? t('BRIEF_V3_VOICE_PROCESSING')
            : isRecording
              ? t('BRIEF_V3_VOICE_RECORDING')
              : t('BRIEF_V3_VOICE_HINT')
        }
      >
        <button
          type='button'
          className={variantClass(buttonVariant, props.compact)}
          onClick={handleClick}
          disabled={props.disabled || isProcessing}
          aria-label={t('BRIEF_V3_VOICE_HINT')}
        >
          {isProcessing ? <LoadingOutlined /> : isRecording ? <span className={styles.stopGlyph} /> : <AudioOutlined />}
        </button>
      </Tooltip>
    </>
  );
};
