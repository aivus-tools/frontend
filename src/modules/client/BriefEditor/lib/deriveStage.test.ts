import { describe, it, expect } from 'vitest';
import { BriefV3Detail, ChatMessageV3, ConversationStatus } from '@/types/briefAi.interface';
import { deriveStage, lastMessageIsAssistant } from './deriveStage';

const makeMessage = (role: 'user' | 'assistant'): ChatMessageV3 => ({
  id: `${role}-${Math.random()}`,
  role,
  content: 'x',
  readyToFinalize: false,
  modelUsed: '',
  inputTokens: 0,
  outputTokens: 0,
  costUsd: '0',
  attachments: [],
  feedback: null,
  createdAt: null,
});

const makeDetail = (overrides: Partial<BriefV3Detail>): BriefV3Detail => ({
  id: 'b1',
  status: 'DRAFT',
  title: '',
  documentLanguage: 'en',
  conversationStatus: 'in_progress',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCostUsd: '0',
  messageCount: 0,
  showCost: false,
  createdAt: null,
  updatedAt: null,
  claimedAt: null,
  pendingTaskId: null,
  messages: [],
  ...overrides,
});

const detailWith = (status: ConversationStatus, messages: ChatMessageV3[]): BriefV3Detail =>
  makeDetail({ conversationStatus: status, messages });

const base = { openedExisting: true, isStarting: false, pendingTaskId: null as string | null };

describe('deriveStage', () => {
  it('returns start when there is no brief', () => {
    expect(deriveStage({ ...base, hasBrief: false, detail: undefined })).toBe('start');
  });

  it('returns start while starting even when a brief exists', () => {
    expect(deriveStage({ ...base, hasBrief: true, detail: makeDetail({}), isStarting: true })).toBe('start');
  });

  it('returns chat when an existing brief is still loading', () => {
    expect(deriveStage({ ...base, hasBrief: true, openedExisting: true, detail: undefined })).toBe('chat');
  });

  it('keeps start when a fresh draft (no props brief) is still loading', () => {
    expect(deriveStage({ ...base, hasBrief: true, openedExisting: false, detail: undefined })).toBe('start');
  });

  it('keeps start when a draft is created but has no messages yet (voice/upload before Start)', () => {
    const detail = detailWith('in_progress', []);
    expect(deriveStage({ ...base, hasBrief: true, openedExisting: false, detail })).toBe('start');
  });

  it('returns generating while loading when a task is already pending', () => {
    expect(
      deriveStage({ ...base, hasBrief: true, openedExisting: false, detail: undefined, pendingTaskId: 'task-1' })
    ).toBe('generating');
  });

  it('returns generating for first reply (pending, in_progress, single message)', () => {
    const detail = detailWith('in_progress', [makeMessage('user')]);
    expect(deriveStage({ ...base, hasBrief: true, detail, pendingTaskId: 'task-1' })).toBe('generating');
  });

  it('returns finalizing when pending and ready_to_finalize', () => {
    const detail = detailWith('ready_to_finalize', [makeMessage('user'), makeMessage('assistant')]);
    expect(deriveStage({ ...base, hasBrief: true, detail, pendingTaskId: 'task-1' })).toBe('finalizing');
  });

  it('returns finalized (regenerate) when pending and already finalized', () => {
    const detail = detailWith('finalized', [makeMessage('user'), makeMessage('assistant')]);
    expect(deriveStage({ ...base, hasBrief: true, detail, pendingTaskId: 'task-1' })).toBe('finalized');
  });

  it('returns chat when pending mid-conversation (in_progress, many messages)', () => {
    const detail = detailWith('in_progress', [makeMessage('user'), makeMessage('assistant'), makeMessage('user')]);
    expect(deriveStage({ ...base, hasBrief: true, detail, pendingTaskId: 'task-1' })).toBe('chat');
  });

  it('returns finalized when not pending and finalized', () => {
    const detail = detailWith('finalized', [makeMessage('assistant')]);
    expect(deriveStage({ ...base, hasBrief: true, detail })).toBe('finalized');
  });

  it('returns chat when not pending and in_progress with messages', () => {
    const detail = detailWith('in_progress', [makeMessage('user'), makeMessage('assistant')]);
    expect(deriveStage({ ...base, hasBrief: true, detail })).toBe('chat');
  });

  it('returns chat when not pending and ready_to_finalize', () => {
    const detail = detailWith('ready_to_finalize', [makeMessage('user'), makeMessage('assistant')]);
    expect(deriveStage({ ...base, hasBrief: true, detail })).toBe('chat');
  });
});

describe('lastMessageIsAssistant', () => {
  it('false for undefined detail', () => {
    expect(lastMessageIsAssistant(undefined)).toBe(false);
  });

  it('false when no messages', () => {
    expect(lastMessageIsAssistant(detailWith('in_progress', []))).toBe(false);
  });

  it('false when last message is user', () => {
    expect(lastMessageIsAssistant(detailWith('in_progress', [makeMessage('assistant'), makeMessage('user')]))).toBe(
      false
    );
  });

  it('true when last message is assistant', () => {
    expect(lastMessageIsAssistant(detailWith('in_progress', [makeMessage('user'), makeMessage('assistant')]))).toBe(
      true
    );
  });
});
