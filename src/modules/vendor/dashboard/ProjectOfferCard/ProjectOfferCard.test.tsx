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
  briefConversationStatus: 'finalized',
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
  });

  it('shows In progress stage badge only for DRAFT status', () => {
    renderCard({ ...baseItem, status: 'DRAFT' });
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.getByText('In progress')).toBeTruthy();
  });

  it('hides stage badge for REVIEWING status', () => {
    renderCard({ ...baseItem, status: 'REVIEWING' });
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.queryByText('In progress')).toBeNull();
  });

  it('hides stage badge for ONGOING status', () => {
    renderCard({ ...baseItem, status: 'ONGOING' });
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.queryByText('In progress')).toBeNull();
  });

  it('hides stage badge for COMPLETED status', () => {
    renderCard({ ...baseItem, status: 'COMPLETED' });
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.queryByText('In progress')).toBeNull();
  });

  it('shows email badge always when hasContactEmail is true', () => {
    renderCard({ ...baseItem, hasContactEmail: true });
    expect(screen.getByText('Email: yes')).toBeTruthy();
  });

  it('shows Email: no when hasContactEmail is false', () => {
    renderCard(baseItem);
    expect(screen.getByText('Email: no')).toBeTruthy();
  });

  it('shows email badge regardless of briefConversationStatus', () => {
    renderCard({ ...baseItem, status: 'DRAFT', briefConversationStatus: 'in_progress', hasContactEmail: true });
    expect(screen.getByText('Email: yes')).toBeTruthy();
    expect(screen.getByText('In progress')).toBeTruthy();
  });

  it('hides lead badges for regular projects with null briefConversationStatus', () => {
    renderCard({ ...baseItem, status: 'RFP', briefConversationStatus: null });
    expect(screen.queryByText('New lead')).toBeNull();
    expect(screen.queryByText('Email: no')).toBeNull();
  });

  it('shows lead badges when briefConversationStatus is set', () => {
    renderCard({ ...baseItem, status: 'RFP', briefConversationStatus: 'finalized', hasContactEmail: false });
    expect(screen.getByText('New lead')).toBeTruthy();
    expect(screen.getByText('Email: no')).toBeTruthy();
  });
});
