import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-agency' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

const mocks = vi.hoisted(() => ({
  getBySlug: vi.fn(),
  createDraft: vi.fn(),
  saveToken: vi.fn(),
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useGetPublicBriefBySlugQuery: mocks.getBySlug,
  useCreatePublicBriefDraftBySlugMutation: () => [mocks.createDraft, {}],
  savePublicBriefToken: mocks.saveToken,
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useCreateBriefAiDraftMutation: () => [vi.fn(), {}],
  useGetBriefAiListQuery: () => ({ data: [], isLoading: false }),
}));

import BrandedBriefStartPage from './page';

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

const mockSlugInfo = {
  valid: true,
  vendorName: 'Test Agency',
  vendorLogoUrl: null,
  slug: 'test-agency',
};

const renderPage = () =>
  render(
    <App>
      <BrandedBriefStartPage />
    </App>
  );

describe('BrandedBriefStartPage', () => {
  beforeEach(() => {
    mocks.getBySlug.mockReturnValue({
      data: mockSlugInfo,
      isLoading: false,
      isError: false,
    });
    mocks.createDraft.mockResolvedValue({ data: { briefId: 'brief-1', token: 'tok-1' } });
  });

  it('renders vendor name and start button', () => {
    renderPage();
    expect(screen.getByText('Brief for Test Agency')).toBeTruthy();
    expect(screen.getByText('Start brief')).toBeTruthy();
  });

  it('shows 404 result when slug is invalid', () => {
    mocks.getBySlug.mockReturnValue({
      data: { ...mockSlugInfo, valid: false },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByText('Link not found')).toBeTruthy();
  });

  it('shows loading spinner when fetching', () => {
    mocks.getBySlug.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderPage();
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });

  it('calls createDraft on start button click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Start brief'));
    await waitFor(() => {
      expect(mocks.createDraft).toHaveBeenCalledWith('test-agency');
    });
  });
});
