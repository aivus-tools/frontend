import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BriefV3Detail } from '@/types/briefAi.interface';

const mocks = vi.hoisted(() => ({
  createDraftFn: vi.fn(),
  startBriefFn: vi.fn(),
  sendChatFn: vi.fn(),
  uploadAttachFn: vi.fn(),
  deleteAttachFn: vi.fn(),
  sendFeedbackFn: vi.fn(),
  finalizeFn: vi.fn(),
  updateQueryDataFn: vi.fn(),
  invalidateTagsFn: vi.fn(),
  pollingStopFn: vi.fn(),
  pollingArgs: {} as { onDone?: (detail: BriefV3Detail) => void },
}));

let detailData: BriefV3Detail | undefined;

vi.mock('@/services/client/briefAiApi', () => ({
  useGetBriefAiDetailQuery: () => ({ data: detailData, isFetching: false, error: undefined }),
  useGetBriefAiFinalDocumentsQuery: () => ({ data: undefined }),
  useCreateBriefAiDraftMutation: () => [mocks.createDraftFn, {}],
  useStartBriefAiMutation: () => [mocks.startBriefFn, {}],
  useSendBriefAiChatMutation: () => [mocks.sendChatFn, {}],
  useUploadBriefAiAttachmentMutation: () => [mocks.uploadAttachFn, {}],
  useDeleteBriefAiAttachmentMutation: () => [mocks.deleteAttachFn, {}],
  useSendBriefAiFeedbackMutation: () => [mocks.sendFeedbackFn, {}],
  useFinalizeBriefAiMutation: () => [mocks.finalizeFn, {}],
  briefAiApi: {
    util: {
      updateQueryData: mocks.updateQueryDataFn,
      invalidateTags: mocks.invalidateTagsFn,
    },
  },
}));

vi.mock('./hooks/useBriefPolling', () => ({
  useBriefPolling: (params: { onDone?: (detail: BriefV3Detail) => void }) => {
    mocks.pollingArgs.onDone = params.onDone;
    return { isPolling: false, stop: mocks.pollingStopFn };
  },
}));

vi.mock('@/modules/client/BriefChat/BriefChatPanel', () => ({
  BriefChatPanel: (props: {
    showRegistrationButton?: boolean;
    composerDisabled?: boolean;
    registrationEmail?: string | null;
  }) => (
    <div
      data-testid='chat-panel'
      data-registration={String(!!props.showRegistrationButton)}
      data-composer-disabled={String(!!props.composerDisabled)}
      data-registration-email={props.registrationEmail ?? ''}
    />
  ),
}));

vi.mock('./components/BriefStartScreen', () => ({
  BriefStartScreen: () => <div data-testid='start-screen' />,
}));

vi.mock('./components/EditableBriefTitle', () => ({
  EditableBriefTitle: () => null,
}));

vi.mock('./BriefFinalPackage', () => ({
  BriefFinalPackage: () => <div data-testid='final-package' />,
}));

vi.mock('@/components/BetaFooter/BetaFooter', () => ({
  useBetaFooterHeight: () => 0,
}));

vi.mock('@/components/BetaFooter/BetaFooterContext', () => ({
  useBetaFooter: () => ({ dismissed: true }),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({
        modal: { confirm: vi.fn() },
        message: { error: vi.fn(), success: vi.fn() },
      }),
    },
  };
});

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
}));

vi.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ isMobile: false, isDesktop: true, ready: true }),
}));

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock('@/lib/i18n', () => ({
  t: (key: string) => key,
  getLocale: () => 'en',
}));

import { AuthenticatedBriefEditor } from './AuthenticatedBriefEditor';

const makeDetail = (overrides: Partial<BriefV3Detail> = {}): BriefV3Detail => ({
  id: 'b1',
  status: 'active',
  title: 'Test Brief',
  documentLanguage: 'en',
  conversationStatus: 'in_progress',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCostUsd: '0',
  messageCount: 2,
  showCost: false,
  createdAt: null,
  updatedAt: null,
  claimedAt: null,
  pendingTaskId: null,
  messages: [
    {
      id: 'm1',
      role: 'user',
      content: 'Hello',
      readyToFinalize: false,
      modelUsed: '',
      inputTokens: 0,
      outputTokens: 0,
      costUsd: '0',
      attachments: [],
      feedback: null,
      createdAt: null,
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'Hi',
      readyToFinalize: false,
      modelUsed: 'gemini',
      inputTokens: 10,
      outputTokens: 20,
      costUsd: '0.001',
      attachments: [],
      feedback: null,
      createdAt: null,
    },
  ],
  ...overrides,
});

describe('AuthenticatedBriefEditor', () => {
  beforeEach(() => {
    detailData = undefined;
    vi.clearAllMocks();
  });

  it('chat render: shows chat-panel with composer enabled when no pendingTaskId', async () => {
    detailData = makeDetail({ conversationStatus: 'in_progress', pendingTaskId: null });

    render(<AuthenticatedBriefEditor briefId='b1' />);

    const panel = await screen.findByTestId('chat-panel');
    expect(panel).toBeInTheDocument();
    expect(panel.getAttribute('data-composer-disabled')).toBe('false');
  });

  it('composer-lock: chat-panel has data-composer-disabled="true" when pendingTaskId is set', async () => {
    detailData = makeDetail({ pendingTaskId: 'task-1', conversationStatus: 'in_progress' });

    render(<AuthenticatedBriefEditor briefId='b1' />);

    const panel = await screen.findByTestId('chat-panel');
    expect(panel.getAttribute('data-composer-disabled')).toBe('true');
  });

  it('start screen: shows start screen when no briefId and no detail', async () => {
    render(<AuthenticatedBriefEditor />);

    await waitFor(() => {
      expect(screen.getByTestId('start-screen')).toBeInTheDocument();
    });
  });

  it('regenerate: invalidates final documents cache when polling completes finalized (C1 regression)', async () => {
    detailData = makeDetail({ conversationStatus: 'finalized', pendingTaskId: 'task-regen' });

    render(<AuthenticatedBriefEditor briefId='b1' />);
    await waitFor(() => expect(mocks.pollingArgs.onDone).toBeTypeOf('function'));

    act(() => {
      mocks.pollingArgs.onDone?.(makeDetail({ conversationStatus: 'finalized', pendingTaskId: null }));
    });

    expect(mocks.invalidateTagsFn).toHaveBeenCalledWith([{ type: 'BriefFinalDocuments', id: 'b1' }, 'BriefV3']);
  });
});
