import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useVoiceRecorder } from './useVoiceRecorder';

const ORIGINAL_MEDIA_RECORDER = (globalThis as { MediaRecorder?: unknown }).MediaRecorder;
const ORIGINAL_MEDIA_DEVICES = navigator.mediaDevices;
const ORIGINAL_AUDIO_CONTEXT = (globalThis as { AudioContext?: unknown }).AudioContext;

class FakeMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true);
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  mimeType: string;

  constructor(_stream: MediaStream, options?: { mimeType?: string }) {
    this.mimeType = options?.mimeType ?? 'audio/webm';
  }

  start() {
    this.state = 'recording';
  }

  requestData() {
    this.ondataavailable?.({ data: new Blob([new Uint8Array([1, 2, 3])], { type: this.mimeType }) });
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob([new Uint8Array([1, 2, 3])], { type: this.mimeType }) });
    this.onstop?.();
  }
}

class FakeAudioContext {
  state = 'running';
  createMediaStreamSource() {
    return { connect: vi.fn(), disconnect: vi.fn() };
  }
  createAnalyser() {
    return {
      fftSize: 512,
      getByteTimeDomainData: (buffer: Uint8Array) => {
        for (let i = 0; i < buffer.length; i += 1) {
          buffer[i] = 128;
        }
      },
    };
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

const fakeStream = {
  getTracks: () => [{ stop: vi.fn() }],
} as unknown as MediaStream;

const installSupport = () => {
  (globalThis as { MediaRecorder?: unknown }).MediaRecorder = FakeMediaRecorder as unknown as typeof MediaRecorder;
  (globalThis as { AudioContext?: unknown }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: vi.fn().mockResolvedValue(fakeStream) },
  });
};

const uninstallSupport = () => {
  if (ORIGINAL_MEDIA_RECORDER === undefined) {
    delete (globalThis as { MediaRecorder?: unknown }).MediaRecorder;
  } else {
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = ORIGINAL_MEDIA_RECORDER;
  }
  if (ORIGINAL_AUDIO_CONTEXT === undefined) {
    delete (globalThis as { AudioContext?: unknown }).AudioContext;
  } else {
    (globalThis as { AudioContext?: unknown }).AudioContext = ORIGINAL_AUDIO_CONTEXT;
  }
  if (ORIGINAL_MEDIA_DEVICES === undefined) {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
  } else {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: ORIGINAL_MEDIA_DEVICES });
  }
};

describe('useVoiceRecorder', () => {
  afterEach(() => {
    uninstallSupport();
    vi.useRealTimers();
  });

  it('reports unsupported when MediaRecorder is missing', () => {
    delete (globalThis as { MediaRecorder?: unknown }).MediaRecorder;
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.state).toBe('idle');
  });

  it('emits unsupported error when start() runs without MediaRecorder', async () => {
    delete (globalThis as { MediaRecorder?: unknown }).MediaRecorder;
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('error');
    expect(result.current.errorCode).toBe('unsupported');
  });

  it('maps permission_denied DOMException to errorCode', async () => {
    installSupport();
    const denied = new DOMException('denied', 'NotAllowedError');
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(denied) },
    });
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('error');
    expect(result.current.errorCode).toBe('permission_denied');
  });

  it('records a blob and resolves stop() with the audio payload', async () => {
    installSupport();
    const { result } = renderHook(() => useVoiceRecorder({ maxDurationMs: 60_000 }));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('recording');

    const outcomeRef: { current: Awaited<ReturnType<typeof result.current.stop>> } = {
      current: null,
    };
    await act(async () => {
      outcomeRef.current = await result.current.stop();
    });
    const outcome = outcomeRef.current;
    expect(outcome).not.toBeNull();
    expect(outcome?.blob).toBeInstanceOf(Blob);
    expect(outcome?.mimeType).toMatch(/^audio\/webm/);
    expect(result.current.state).toBe('idle');
  });

  it('cancel() does not resolve stop() with a blob', async () => {
    installSupport();
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      result.current.cancel();
    });
    expect(result.current.state).toBe('idle');
  });
});
