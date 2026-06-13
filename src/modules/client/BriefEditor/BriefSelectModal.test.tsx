import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
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
  getBriefList: vi.fn(),
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useGetBriefAiListQuery: mocks.getBriefList,
  useCreateBriefAiDraftMutation: () => [vi.fn(), {}],
}));

import { BriefSelectModal } from './BriefSelectModal';

const renderModal = (props?: Partial<Parameters<typeof BriefSelectModal>[0]>) =>
  render(
    <App>
      <BriefSelectModal
        value={true}
        onChange={vi.fn()}
        vendorName='Acme'
        sentBriefIds={[]}
        onSelectNew={vi.fn()}
        onSelectExisting={vi.fn()}
        {...props}
      />
    </App>
  );

describe('BriefSelectModal', () => {
  beforeEach(() => {
    mocks.getBriefList.mockReturnValue({ data: [], isLoading: false });
  });

  it('renders start new button', () => {
    renderModal();
    expect(screen.getByText('Start new brief with AI')).toBeTruthy();
  });

  it('shows finalized briefs in list', () => {
    mocks.getBriefList.mockReturnValue({
      data: [
        {
          id: 'b1',
          title: 'My Video Brief',
          conversationStatus: 'finalized',
          status: 'finalized',
          messageCount: 5,
          totalCostUsd: '0',
          createdAt: null,
          updatedAt: null,
          claimedAt: null,
          offersCount: 0,
        },
      ],
      isLoading: false,
    });
    renderModal();
    expect(screen.getByText('My Video Brief')).toBeTruthy();
  });

  it('shows already sent tag for sent briefs', () => {
    mocks.getBriefList.mockReturnValue({
      data: [
        {
          id: 'b2',
          title: 'Sent Brief',
          conversationStatus: 'finalized',
          status: 'finalized',
          messageCount: 3,
          totalCostUsd: '0',
          createdAt: null,
          updatedAt: null,
          claimedAt: null,
          offersCount: 0,
        },
      ],
      isLoading: false,
    });
    renderModal({ sentBriefIds: ['b2'] });
    expect(screen.getByText('Already sent')).toBeTruthy();
  });

  it('does not show in_progress briefs in list', () => {
    mocks.getBriefList.mockReturnValue({
      data: [
        {
          id: 'b3',
          title: 'Ongoing Brief',
          conversationStatus: 'in_progress',
          status: 'in_progress',
          messageCount: 2,
          totalCostUsd: '0',
          createdAt: null,
          updatedAt: null,
          claimedAt: null,
          offersCount: 0,
        },
      ],
      isLoading: false,
    });
    renderModal();
    expect(screen.queryByText('Ongoing Brief')).toBeNull();
    expect(screen.queryByText('Use an existing brief')).toBeNull();
  });
});
