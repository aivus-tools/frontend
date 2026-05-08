'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, Tooltip } from 'antd';
import { AudioOutlined, CloseOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { getLocale, t } from '@/lib/i18n';
import { useVoiceRecorder, VoiceRecorderError } from '@/hooks/useVoiceRecorder';
import { useTranscribeBriefAiMutation } from '@/services/client/briefAiApi';
import { useTranscribePublicBriefMutation } from '@/services/client/publicBriefApi';
import { VoiceButton, VoiceIconBtn, VoicePanel, VoiceTimer, VoiceWave, VoiceWaveBar } from './styled';

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

export const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = (props) => {
  const { message: messageApi } = App.useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [waveSamples, setWaveSamples] = useState<number[]>(() => Array(WAVE_BARS).fill(0));
  const sampleBufferRef = useRef<number[]>(Array(WAVE_BARS).fill(0));
  const briefContextRef = useRef<{ briefId: string | null; token: string | null }>({
    briefId: props.briefId,
    token: props.publicToken,
  });

  useEffect(() => {
    briefContextRef.current = { briefId: props.briefId, token: props.publicToken };
  }, [props.briefId, props.publicToken]);

  const onAutoStop = useCallback(() => {
    messageApi.warning(t('BRIEF_V3_VOICE_LIMIT_REACHED'));
  }, [messageApi]);

  const recorder = useVoiceRecorder({ maxDurationMs: MAX_DURATION_MS, onAutoStop });

  const [transcribeAuth] = useTranscribeBriefAiMutation();
  const [transcribePublic] = useTranscribePublicBriefMutation();

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

  const callTranscribe = useCallback(
    async (blob: Blob, mimeType: string) => {
      const ctx = briefContextRef.current;
      if (!ctx.briefId) {
        messageApi.error(t('BRIEF_V3_VOICE_TRANSCRIBE_FAILED'));
        return;
      }
      setIsProcessing(true);
      const language = getLocale();
      try {
        const result = props.isPublic
          ? await transcribePublic({
              briefId: ctx.briefId,
              token: ctx.token ?? '',
              audio: blob,
              mimeType,
              language,
            }).unwrap()
          : await transcribeAuth({
              briefId: ctx.briefId,
              audio: blob,
              mimeType,
              language,
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

  const handleClick = useCallback(async () => {
    if (props.disabled || isProcessing) {
      return;
    }
    if (recorder.state === 'idle' || recorder.state === 'error') {
      if (!briefContextRef.current.briefId) {
        if (!props.onEnsureBrief) {
          return;
        }
        const ensured = await props.onEnsureBrief();
        if (!ensured?.briefId) {
          return;
        }
        briefContextRef.current = { briefId: ensured.briefId, token: ensured.token };
      }
      await recorder.start();
      return;
    }
    if (recorder.state === 'recording') {
      const result = await recorder.stop();
      if (result) {
        await callTranscribe(result.blob, result.mimeType);
      }
    }
  }, [callTranscribe, isProcessing, props, recorder]);

  const handleStop = useCallback(async () => {
    if (recorder.state !== 'recording') {
      return;
    }
    const result = await recorder.stop();
    if (result) {
      await callTranscribe(result.blob, result.mimeType);
    }
  }, [callTranscribe, recorder]);

  const handleCancel = useCallback(() => {
    recorder.cancel();
  }, [recorder]);

  const buttonVariant = useMemo<'idle' | 'recording' | 'processing' | 'error'>(() => {
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

  return (
    <>
      {recorder.state === 'recording' ? (
        <VoicePanel>
          <VoiceTimer aria-live='polite'>{formatTime(remainingMs)}</VoiceTimer>
          <VoiceWave>
            {waveSamples.map((level, i) => (
              <VoiceWaveBar key={i} $level={level} />
            ))}
          </VoiceWave>
          <VoiceIconBtn $tone='cancel' onClick={handleCancel} aria-label={t('BRIEF_V3_VOICE_CANCEL')}>
            <CloseOutlined />
          </VoiceIconBtn>
          <VoiceIconBtn $tone='stop' onClick={handleStop} aria-label={t('BRIEF_V3_VOICE_STOP')}>
            <StopOutlined />
          </VoiceIconBtn>
        </VoicePanel>
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
        <VoiceButton
          type='button'
          $variant={buttonVariant}
          $compact={props.compact}
          onClick={handleClick}
          disabled={props.disabled || isProcessing}
          aria-label={t('BRIEF_V3_VOICE_HINT')}
        >
          {isProcessing ? <LoadingOutlined /> : isRecording ? <StopOutlined /> : <AudioOutlined />}
        </VoiceButton>
      </Tooltip>
    </>
  );
};
