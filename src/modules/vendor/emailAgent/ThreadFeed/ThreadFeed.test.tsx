import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

const mocks = vi.hoisted(() => ({
  getThreads: vi.fn(),
}));

vi.mock('@/services/client/emailAgentApi', () => ({
  useGetThreadsQuery: mocks.getThreads,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { ThreadFeed } from './ThreadFeed';

const thread = {
  threadId: 't1',
  clientEmail: 'jane@client.com',
  clientName: 'Jane',
  subject: 'New commercial',
  state: 'engaged',
  projectId: null,
  projectName: '',
  needsAction: true,
  pendingDraftCount: 1,
  overdueItemCount: 2,
  openItemCount: 0,
  lastActivityAt: '2026-07-10T10:00:00Z',
  lastMessageFrom: 'jane@client.com',
  lastMessagePreview: 'Looking forward to seeing your portfolio.',
  lastMessageAt: '2026-07-10T10:00:00Z',
  lastMessageDirection: 'in' as const,
};

describe('ThreadFeed', () => {
  it('renders a gmail-style row with sender, subject and last-message preview', () => {
    mocks.getThreads.mockReturnValue({
      data: { threads: [thread], total: 1, limit: 25, offset: 0, hasMore: false },
      isLoading: false,
      isFetching: false,
    });
    render(
      <App>
        <ThreadFeed />
      </App>
    );
    expect(screen.getByText('Jane')).toBeTruthy();
    expect(screen.getByText('New commercial')).toBeTruthy();
    expect(screen.getByText('Looking forward to seeing your portfolio.')).toBeTruthy();
  });

  it('renders the empty state when there are no threads', () => {
    mocks.getThreads.mockReturnValue({
      data: { threads: [], total: 0, limit: 25, offset: 0, hasMore: false },
      isLoading: false,
      isFetching: false,
    });
    render(
      <App>
        <ThreadFeed />
      </App>
    );
    expect(
      screen.getByText('No conversations yet. Once your mailbox is connected, client emails will show up here.')
    ).toBeTruthy();
  });
});
