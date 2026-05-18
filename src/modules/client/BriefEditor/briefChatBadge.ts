import { ChatMessageV3 } from '@/types/briefAi.interface';

export type MobileTab = 'brief' | 'chat';

export interface ChatBadgeState {
  mobileTab: MobileTab;
  lastSeenAssistantMessageId: string | null;
}

export const computeChatBadge = (messages: ChatMessageV3[], state: ChatBadgeState): boolean => {
  if (state.mobileTab === 'chat') {
    return false;
  }
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') {
    return false;
  }
  return last.id !== state.lastSeenAssistantMessageId;
};

export const nextLastSeenOnTabSwitch = (
  messages: ChatMessageV3[],
  newTab: MobileTab,
  currentLastSeen: string | null
): string | null => {
  if (newTab !== 'chat') {
    return currentLastSeen;
  }
  const last = messages[messages.length - 1];
  if (last && last.role === 'assistant') {
    return last.id;
  }
  return currentLastSeen;
};
