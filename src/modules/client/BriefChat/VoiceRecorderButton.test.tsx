import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

const mockUseVoiceRecorder = vi.fn();
const mockTranscribeAuth = vi.fn();
const mockTranscribePublic = vi.fn();
const mockMessageError = vi.fn();
const mockMessageWarning = vi.fn();

vi.mock('@/hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: (...args: unknown[]) => mockUseVoiceRecorder(...args),
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useTranscribeBriefAiMutation: () => [mockTranscribeAuth, { isLoading: false }],
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useTranscribePublicBriefMutation: () => [mockTranscribePublic, { isLoading: false }],
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({
        message: {
          error: mockMessageError,
          warning: mockMessageWarning,
          success: vi.fn(),
        },
      }),
    },
  };
});

import { VoiceRecorderButton } from './VoiceRecorderButton';

const buildRecorder = (overrides: Record<string, unknown> = {}) => ({
  state: 'idle',
  errorCode: null,
  audioLevel: 0,
  elapsedMs: 0,
  start: vi.fn(),
  stop: vi.fn(),
  cancel: vi.fn(),
  isSupported: true,
  ...overrides,
});

const renderButton = (overrides: Partial<React.ComponentProps<typeof VoiceRecorderButton>> = {}) => {
  return render(
    <VoiceRecorderButton
      briefId='brief-1'
      isPublic={false}
      publicToken={null}
      disabled={false}
      onTranscript={vi.fn()}
      {...overrides}
    />
  );
};

describe('VoiceRecorderButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when MediaRecorder is unsupported', () => {
    mockUseVoiceRecorder.mockReturnValue(buildRecorder({ isSupported: false }));
    const { container } = renderButton();
    expect(container.firstChild).toBeNull();
  });

  it('renders the microphone button in idle state', () => {
    mockUseVoiceRecorder.mockReturnValue(buildRecorder());
    renderButton();
    const button = screen.getByRole('button', { name: /record voice message/i });
    expect(button).toBeInTheDocument();
  });

  it('start() is called when idle button is clicked', () => {
    const recorder = buildRecorder();
    mockUseVoiceRecorder.mockReturnValue(recorder);
    renderButton();
    const button = screen.getByRole('button', { name: /record voice message/i });
    fireEvent.click(button);
    expect(recorder.start).toHaveBeenCalledTimes(1);
  });

  it('starts recording within the gesture without awaiting draft creation', async () => {
    const recorder = buildRecorder();
    mockUseVoiceRecorder.mockReturnValue(recorder);
    const onEnsureBrief = vi.fn(() => new Promise<never>(() => {}));
    renderButton({ briefId: null, onEnsureBrief });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /record voice message/i }));
    });
    expect(onEnsureBrief).toHaveBeenCalledTimes(1);
    expect(recorder.start).toHaveBeenCalledTimes(1);
  });

  it('renders the recording panel with stop and cancel controls while recording', () => {
    const recorder = buildRecorder({ state: 'recording', audioLevel: 0.4, elapsedMs: 5_000 });
    mockUseVoiceRecorder.mockReturnValue(recorder);
    renderButton();
    expect(screen.getByLabelText(/stop and transcribe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText('0:55')).toBeInTheDocument();
  });

  it('stop button triggers recorder.stop and forwards transcript', async () => {
    const stop = vi.fn().mockResolvedValue({
      blob: new Blob([new Uint8Array([1])], { type: 'audio/webm' }),
      mimeType: 'audio/webm',
      durationMs: 1234,
    });
    mockUseVoiceRecorder.mockReturnValue(buildRecorder({ state: 'recording', stop }));
    mockTranscribeAuth.mockReturnValue({
      unwrap: () => Promise.resolve({ text: 'hi there', language: 'en-US', model: 'chirp_3' }),
    });
    const onTranscript = vi.fn();
    renderButton({ onTranscript });
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/stop and transcribe/i));
    });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(mockTranscribeAuth).toHaveBeenCalledWith(
      expect.objectContaining({ briefId: 'brief-1', mimeType: 'audio/webm' })
    );
    expect(onTranscript).toHaveBeenCalledWith('hi there');
  });

  it('public mode calls the public mutation with the token', async () => {
    const stop = vi.fn().mockResolvedValue({
      blob: new Blob([new Uint8Array([1])], { type: 'audio/webm' }),
      mimeType: 'audio/webm',
      durationMs: 100,
    });
    mockUseVoiceRecorder.mockReturnValue(buildRecorder({ state: 'recording', stop }));
    mockTranscribePublic.mockReturnValue({
      unwrap: () => Promise.resolve({ text: 'public hi', language: 'en-US', model: 'chirp_3' }),
    });
    const onTranscript = vi.fn();
    renderButton({ isPublic: true, publicToken: 'tok-1', onTranscript });
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/stop and transcribe/i));
    });
    expect(mockTranscribePublic).toHaveBeenCalledWith(
      expect.objectContaining({ briefId: 'brief-1', token: 'tok-1', mimeType: 'audio/webm' })
    );
    expect(mockTranscribeAuth).not.toHaveBeenCalled();
    expect(onTranscript).toHaveBeenCalledWith('public hi');
  });

  it('shows an error toast when permission is denied', () => {
    mockUseVoiceRecorder.mockReturnValue(buildRecorder({ state: 'error', errorCode: 'permission_denied' }));
    renderButton();
    expect(mockMessageError).toHaveBeenCalled();
  });

  it('shows a no-speech toast when API returns NO_SPEECH_DETECTED', async () => {
    const stop = vi.fn().mockResolvedValue({
      blob: new Blob([new Uint8Array([1])], { type: 'audio/webm' }),
      mimeType: 'audio/webm',
      durationMs: 100,
    });
    mockUseVoiceRecorder.mockReturnValue(buildRecorder({ state: 'recording', stop }));
    mockTranscribeAuth.mockReturnValue({
      unwrap: () => Promise.reject({ data: { code: 'NO_SPEECH_DETECTED' } }),
    });
    renderButton();
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/stop and transcribe/i));
    });
    expect(mockMessageError).toHaveBeenCalled();
  });
});
