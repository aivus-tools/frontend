import { describe, expect, it } from 'vitest';
import { ChatMessageV3 } from '@/types/briefAi.interface';
import { computeChatBadge, nextLastSeenOnTabSwitch } from './briefChatBadge';

const makeMessage = (id: string, role: 'user' | 'assistant'): ChatMessageV3 => ({
  id,
  role,
  content: role === 'user' ? 'hello' : 'hi there',
  readyToFinalize: false,
  modelUsed: '',
  inputTokens: 0,
  outputTokens: 0,
  costUsd: '0',
  attachments: [],
  feedback: null,
  createdAt: '2026-05-15T00:00:00Z',
});

describe('computeChatBadge', () => {
  it('returns false when there are no messages', () => {
    const result = computeChatBadge([], { mobileTab: 'brief', lastSeenAssistantMessageId: null });
    expect(result).toBe(false);
  });

  it('returns false when the last message is from the user', () => {
    const result = computeChatBadge([makeMessage('u1', 'user')], {
      mobileTab: 'brief',
      lastSeenAssistantMessageId: null,
    });
    expect(result).toBe(false);
  });

  it('returns true when last message is assistant and was never seen', () => {
    const result = computeChatBadge([makeMessage('u1', 'user'), makeMessage('a1', 'assistant')], {
      mobileTab: 'brief',
      lastSeenAssistantMessageId: null,
    });
    expect(result).toBe(true);
  });

  it('returns false when on the chat tab', () => {
    const result = computeChatBadge([makeMessage('u1', 'user'), makeMessage('a1', 'assistant')], {
      mobileTab: 'chat',
      lastSeenAssistantMessageId: null,
    });
    expect(result).toBe(false);
  });

  it('returns false when last assistant id matches the seen id', () => {
    const result = computeChatBadge([makeMessage('u1', 'user'), makeMessage('a1', 'assistant')], {
      mobileTab: 'brief',
      lastSeenAssistantMessageId: 'a1',
    });
    expect(result).toBe(false);
  });

  it('returns true again when a new assistant message arrives after a seen one', () => {
    const result = computeChatBadge(
      [makeMessage('u1', 'user'), makeMessage('a1', 'assistant'), makeMessage('a2', 'assistant')],
      { mobileTab: 'brief', lastSeenAssistantMessageId: 'a1' }
    );
    expect(result).toBe(true);
  });
});

describe('nextLastSeenOnTabSwitch', () => {
  it('preserves current value when switching away from chat', () => {
    const result = nextLastSeenOnTabSwitch([makeMessage('a1', 'assistant')], 'brief', 'a0');
    expect(result).toBe('a0');
  });

  it('updates to last assistant id when switching to chat', () => {
    const result = nextLastSeenOnTabSwitch([makeMessage('u1', 'user'), makeMessage('a1', 'assistant')], 'chat', null);
    expect(result).toBe('a1');
  });

  it('returns previous value when switching to chat and last message is user', () => {
    const result = nextLastSeenOnTabSwitch([makeMessage('u1', 'user')], 'chat', 'a0');
    expect(result).toBe('a0');
  });

  it('returns previous value when switching to chat with empty messages', () => {
    const result = nextLastSeenOnTabSwitch([], 'chat', null);
    expect(result).toBe(null);
  });
});

describe('chat badge full flow', () => {
  it('clears on chat tab visit and stays cleared after returning to brief; reappears on new assistant', () => {
    const initial: ChatMessageV3[] = [makeMessage('u1', 'user'), makeMessage('a1', 'assistant')];

    let lastSeen: string | null = null;
    let tab: 'brief' | 'chat' = 'brief';

    expect(computeChatBadge(initial, { mobileTab: tab, lastSeenAssistantMessageId: lastSeen })).toBe(true);

    tab = 'chat';
    lastSeen = nextLastSeenOnTabSwitch(initial, tab, lastSeen);
    expect(lastSeen).toBe('a1');
    expect(computeChatBadge(initial, { mobileTab: tab, lastSeenAssistantMessageId: lastSeen })).toBe(false);

    tab = 'brief';
    lastSeen = nextLastSeenOnTabSwitch(initial, tab, lastSeen);
    expect(computeChatBadge(initial, { mobileTab: tab, lastSeenAssistantMessageId: lastSeen })).toBe(false);

    const withNew: ChatMessageV3[] = [...initial, makeMessage('u2', 'user'), makeMessage('a2', 'assistant')];
    expect(computeChatBadge(withNew, { mobileTab: tab, lastSeenAssistantMessageId: lastSeen })).toBe(true);

    tab = 'chat';
    lastSeen = nextLastSeenOnTabSwitch(withNew, tab, lastSeen);
    expect(lastSeen).toBe('a2');
    expect(computeChatBadge(withNew, { mobileTab: tab, lastSeenAssistantMessageId: lastSeen })).toBe(false);
  });
});
