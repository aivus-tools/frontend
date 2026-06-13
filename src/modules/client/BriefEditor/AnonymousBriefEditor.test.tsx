import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BriefV3Detail } from '@/types/briefAi.interface';

const mocks = vi.hoisted(() => ({
  createDraftFn: vi.fn(),
  startBriefFn: vi.fn(),
  sendChatFn: vi.fn(),
  uploadAttachFn: vi.fn(),
  deleteAttachFn: vi.fn(),
  savePublicBriefTokenFn: vi.fn(),
  updateQueryDataFn: vi.fn(),
  pollingStopFn: vi.fn(),
}));

let detailData: BriefV3Detail | undefined;

vi.mock('@/services/client/publicBriefApi', () => ({
  useGetPublicBriefDetailQuery: () => ({ data: detailData, isFetching: false }),
  useGetPublicBriefFinalDocumentsQuery: () => ({ data: undefined }),
  useCreatePublicBriefDraftMutation: () => [mocks.createDraftFn, {}],
  useStartPublicBriefMutation: () => [mocks.startBriefFn, {}],
  useSendPublicBriefChatMutation: () => [mocks.sendChatFn, {}],
  useUploadPublicBriefAttachmentMutation: () => [mocks.uploadAttachFn, {}],
  useDeletePublicBriefAttachmentMutation: () => [mocks.deleteAttachFn, {}],
  savePublicBriefToken: mocks.savePublicBriefTokenFn,
  publicBriefApi: {
    util: {
      updateQueryData: mocks.updateQueryDataFn,
    },
  },
}));

vi.mock('./hooks/useBriefPolling', () => ({
  useBriefPolling: () => ({ isPolling: false, stop: mocks.pollingStopFn }),
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('./components/BriefStartScreen', () => ({
  BriefStartScreen: () => <div data-testid='start-screen' />,
}));

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock('@/lib/i18n', () => ({
  t: (key: string) => {
    const map: Record<string, string> = {
      BRIEF_LINK_BROKEN: 'This brief link is broken or expired.',
      BRIEF_NEW: 'New brief',
    };
    return map[key] ?? key;
  },
  getLocale: () => 'en',
}));

import { AnonymousBriefEditor } from './AnonymousBriefEditor';

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

describe('AnonymousBriefEditor', () => {
  beforeEach(() => {
    detailData = undefined;
    vi.clearAllMocks();
  });

  it('empty-state: shows broken-link message when briefId provided but token is null', async () => {
    render(<AnonymousBriefEditor briefId='b1' token={null} />);

    await waitFor(() => {
      expect(screen.getByText('This brief link is broken or expired.')).toBeInTheDocument();
    });

    expect(screen.getByText('New brief')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
  });

  it('start-screen: shows start screen when no briefId and no token', async () => {
    render(<AnonymousBriefEditor />);

    await waitFor(() => {
      expect(screen.getByTestId('start-screen')).toBeInTheDocument();
    });
  });

  it('registration: shows chat-panel with data-registration="true" when status is ready_to_finalize', async () => {
    detailData = makeDetail({ conversationStatus: 'ready_to_finalize', pendingTaskId: null });

    render(<AnonymousBriefEditor briefId='b1' token='tok' />);

    const panel = await screen.findByTestId('chat-panel');
    expect(panel).toBeInTheDocument();
    expect(panel.getAttribute('data-registration')).toBe('true');
  });

  it('composer-lock: chat-panel has data-composer-disabled="true" when pendingTaskId is set', async () => {
    detailData = makeDetail({ pendingTaskId: 'task-1', conversationStatus: 'in_progress' });

    render(<AnonymousBriefEditor briefId='b1' token='tok' />);

    const panel = await screen.findByTestId('chat-panel');
    expect(panel.getAttribute('data-composer-disabled')).toBe('true');
  });
});
