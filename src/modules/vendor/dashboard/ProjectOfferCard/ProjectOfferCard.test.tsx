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
  it('shows no lead badges when briefConversationStatus is null', () => {
    renderCard(baseItem);
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.queryByText('In progress')).toBeNull();
  });

  it('shows New lead badge when status is finalized', () => {
    renderCard({ ...baseItem, briefConversationStatus: 'finalized', hasContactEmail: true });
    expect(screen.getByText('New lead')).toBeTruthy();
    expect(screen.getByText('Email: yes')).toBeTruthy();
  });

  it('shows In progress badge when status is in_progress', () => {
    renderCard({ ...baseItem, briefConversationStatus: 'in_progress' });
    expect(screen.getByText('In progress')).toBeTruthy();
    expect(screen.queryByText('New lead')).toBeNull();
  });

  it('shows Email: no when finalized but no contact email', () => {
    renderCard({ ...baseItem, briefConversationStatus: 'finalized', hasContactEmail: false });
    expect(screen.getByText('Email: no')).toBeTruthy();
  });
});
