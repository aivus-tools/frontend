import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { App } from 'antd';

const navMocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  searchParamsGet: vi.fn().mockReturnValue(null),
}));

const sessionMock = vi.hoisted(() => ({
  value: { data: null, status: 'unauthenticated' } as { data: unknown; status: string },
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-agency' }),
  useRouter: () => ({ push: navMocks.push, replace: navMocks.replace }),
  useSearchParams: () => ({ get: navMocks.searchParamsGet }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => sessionMock.value,
}));

const mocks = vi.hoisted(() => ({
  getBySlug: vi.fn(),
  createDraftBySlugFn: vi.fn(),
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useGetPublicBriefBySlugQuery: mocks.getBySlug,
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useCreateBriefAiDraftBySlugMutation: () => [mocks.createDraftBySlugFn, {}],
  useGetSentBriefIdsToVendorQuery: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/modules/client/BriefEditor/BriefSelectModal', () => ({
  BriefSelectModal: (props: { onSelectNew?: () => void }) => (
    <button type='button' data-testid='select-new' onClick={() => props.onSelectNew?.()}>
      new
    </button>
  ),
}));

vi.mock('@/modules/client/BriefEditor/BrandedBriefWorkspace', () => ({
  BrandedBriefWorkspace: () => <div data-testid='workspace' />,
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
    navMocks.push.mockReset();
    navMocks.replace.mockReset();
    navMocks.searchParamsGet.mockReturnValue(null);
    sessionMock.value = { data: null, status: 'unauthenticated' };
    mocks.getBySlug.mockReturnValue({ data: mockSlugInfo, isLoading: false, isError: false });
  });

  it('opens the AI dialog (workspace) straight away for an anonymous visitor', () => {
    renderPage();
    expect(screen.getByTestId('workspace')).toBeTruthy();
  });

  it('shows the branded card with Start button for an authenticated client', () => {
    sessionMock.value = { data: { user: { group: 'CLIENT' } }, status: 'authenticated' };
    navMocks.searchParamsGet.mockImplementation((key: string) => (key === 'authed' ? '1' : null));
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
    mocks.getBySlug.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderPage();
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });

  it('authenticated: starts a new brief via the by-slug draft mutation', async () => {
    mocks.createDraftBySlugFn.mockReturnValue({
      unwrap: () => Promise.resolve({ briefId: 'new-1' }),
    });
    sessionMock.value = { data: { user: { group: 'CLIENT' } }, status: 'authenticated' };
    navMocks.searchParamsGet.mockImplementation((key: string) => (key === 'authed' ? '1' : null));
    renderPage();

    await act(async () => {
      fireEvent.click(screen.getByTestId('select-new'));
    });

    expect(mocks.createDraftBySlugFn).toHaveBeenCalledWith('test-agency');
  });
});
