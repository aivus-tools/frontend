import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  getDrafts: vi.fn(),
  approve: vi.fn(),
  edit: vi.fn(),
  reject: vi.fn(),
}));

vi.mock('@/services/client/emailAgentApi', () => ({
  useGetDraftsQuery: mocks.getDrafts,
  useApproveDraftMutation: () => [mocks.approve, { isLoading: false }],
  useEditDraftMutation: () => [mocks.edit, { isLoading: false }],
  useRejectDraftMutation: () => [mocks.reject, { isLoading: false }],
}));

import { DraftReviewList } from './DraftReviewList';

const draft = {
  id: 'd1',
  threadId: 't1',
  kind: 'first_reply',
  status: 'pending',
  body: 'Thanks for reaching out, we will get back to you.',
  to: ['jane@client.com'],
  cc: ['pm@vendor.com'],
  subject: 'Re: Brand video',
  inReplyToPreview: 'Hi, can you send me a quote by Friday?',
  inReplyToFrom: 'jane@client.com',
  inReplyToDate: '2026-07-10T09:00:00Z',
  variant: 'A',
  action: 'acknowledge_receipt',
  edited: false,
  overdue: false,
  expiresAt: null,
  createdAt: '2026-07-10T10:00:00Z',
};

describe('DraftReviewList', () => {
  it('shows a draft and calls approve on click', async () => {
    mocks.getDrafts.mockReturnValue({ data: { drafts: [draft] }, isLoading: false });
    mocks.approve.mockReturnValue({ unwrap: () => Promise.resolve({ draft }) });

    render(
      <App>
        <DraftReviewList />
      </App>
    );

    expect(screen.getByText('Thanks for reaching out, we will get back to you.')).toBeTruthy();
    await userEvent.click(screen.getByText('Approve and send'));
    expect(mocks.approve).toHaveBeenCalledWith({ draftId: 'd1' });
  });

  it('renders the empty state', () => {
    mocks.getDrafts.mockReturnValue({ data: { drafts: [] }, isLoading: false });
    render(
      <App>
        <DraftReviewList />
      </App>
    );
    expect(screen.getByText('No drafts are waiting for your approval.')).toBeTruthy();
  });

  it('shows recipients, subject, and the original message preview', async () => {
    mocks.getDrafts.mockReturnValue({ data: { drafts: [draft] }, isLoading: false });

    render(
      <App>
        <DraftReviewList />
      </App>
    );

    expect(screen.getByText('jane@client.com')).toBeTruthy();
    expect(screen.getByText('pm@vendor.com')).toBeTruthy();
    expect(screen.getByText('Re: Brand video')).toBeTruthy();

    await userEvent.click(screen.getByText('Show original message'));
    expect(screen.getByText(/Hi, can you send me a quote by Friday/)).toBeTruthy();
  });
});
