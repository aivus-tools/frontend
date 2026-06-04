import { BriefAttachment, ChatMessageV3 } from '@/types/briefAi.interface';

export const LOCAL_MESSAGE_PREFIX = 'local-';

export const isLocalMessage = (message: ChatMessageV3): boolean => {
  return message.id.startsWith(LOCAL_MESSAGE_PREFIX);
};

export const makeLocalUserMessage = (content: string, attachments: BriefAttachment[]): ChatMessageV3 => {
  return {
    id: LOCAL_MESSAGE_PREFIX + Date.now(),
    role: 'user',
    content,
    readyToFinalize: false,
    modelUsed: '',
    inputTokens: 0,
    outputTokens: 0,
    costUsd: '0',
    attachments,
    feedback: null,
    createdAt: new Date().toISOString(),
  };
};
