import React from 'react';
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

vi.mock('@/services/client/offersApi', () => ({
  useUpdateOfferStatusMutation: () => [vi.fn(), {}],
}));

vi.mock('@/services/client/projectsApi', () => ({
  useDeleteProjectMutation: () => [vi.fn(), {}],
  useRestoreProjectMutation: () => [vi.fn(), {}],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { ProjectOfferCard } from './ProjectOfferCard';
import { ProjectListItem } from '@/types/project.interface';

const baseItem: ProjectListItem = {
  id: 'p1',
  title: 'Test Project',
  clientName: 'ACME',
  status: 'RFP',
  createdAt: '2026-01-01',
  briefConversationStatus: null,
  hasContactEmail: false,
};

const renderCard = (item: ProjectListItem) =>
  render(
    <App>
      <ProjectOfferCard item={item} offers={[]} onClick={vi.fn()} />
    </App>
  );

describe('ProjectOfferCard lead markers', () => {
  it('shows New lead stage badge for RFP status', () => {
    renderCard(baseItem);
    expect(screen.getByText('New lead')).toBeTruthy();
    expect(screen.queryByText('In progress')).toBeNull();
    expect(screen.queryByText('Email: yes')).toBeNull();
  });

  it('shows In progress stage badge for DRAFT status', () => {
    renderCard({ ...baseItem, status: 'DRAFT', briefConversationStatus: null });
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.getByText('In progress')).toBeTruthy();
  });

  it('shows both stage and brief badges when briefConversationStatus is finalized', () => {
    renderCard({ ...baseItem, status: 'DRAFT', briefConversationStatus: 'finalized', hasContactEmail: true });
    expect(screen.getAllByText('New lead')).toHaveLength(1);
    expect(screen.getByText('Email: yes')).toBeTruthy();
    expect(screen.getByText('In progress')).toBeTruthy();
  });

  it('shows In progress brief badge when briefConversationStatus is in_progress', () => {
    renderCard({ ...baseItem, briefConversationStatus: 'in_progress' });
    expect(screen.getAllByText('In progress')).toHaveLength(1);
  });

  it('shows Email: no when finalized but no contact email', () => {
    renderCard({ ...baseItem, briefConversationStatus: 'finalized', hasContactEmail: false });
    expect(screen.getByText('Email: no')).toBeTruthy();
  });
});
