import { BriefV3Detail } from '@/types/briefAi.interface';

export type BriefStage = 'start' | 'generating' | 'chat' | 'finalizing' | 'finalized';

interface DeriveStageParams {
  hasBrief: boolean;
  openedExisting: boolean;
  detail: BriefV3Detail | undefined;
  isStarting: boolean;
  pendingTaskId: string | null;
}

export const lastMessageIsAssistant = (detail: BriefV3Detail | undefined): boolean => {
  const messages = detail?.messages ?? [];
  const last = messages.length > 0 ? messages[messages.length - 1] : null;
  return last?.role === 'assistant';
};

export const deriveStage = (params: DeriveStageParams): BriefStage => {
  if (!params.hasBrief || params.isStarting) {
    return 'start';
  }

  const pending = !!params.pendingTaskId;
  const detail = params.detail;

  if (!detail) {
    if (pending) {
      return 'generating';
    }
    return params.openedExisting ? 'chat' : 'start';
  }

  const status = detail.conversationStatus;
  const messageCount = (detail.messages ?? []).length;

  if (pending) {
    if (status === 'ready_to_finalize') {
      return 'finalizing';
    }
    if (status === 'finalized') {
      return 'finalized';
    }
    if (messageCount <= 1) {
      return 'generating';
    }
    return 'chat';
  }

  if (status === 'finalized') {
    return 'finalized';
  }
  if (messageCount === 0) {
    return 'start';
  }
  return 'chat';
};
