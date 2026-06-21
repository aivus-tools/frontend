'use client';

import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { GROUPS } from '@/constants/constants';

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
  claimBrief: vi.fn(),
  replace: vi.fn(),
  removePublicBriefToken: vi.fn(),
  getPublicBriefToken: vi.fn(),
  session: { data: { user: { group: 'CLIENT' } }, status: 'authenticated' } as {
    data: { user: { group: string } } | null;
    status: string;
  },
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useClaimPublicBriefMutation: () => [mocks.claimBrief, {}],
  getPublicBriefToken: mocks.getPublicBriefToken,
  removePublicBriefToken: mocks.removePublicBriefToken,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ briefId: 'brief-123' }),
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.session,
}));

vi.mock('@/components/PageSpinner', () => ({
  PageSpinner: () => <div data-testid='spinner' />,
}));

import BriefClaimPage from './page';

const renderPage = (token?: string) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { search: token ? `?token=${token}` : '' },
  });
  return render(
    <App>
      <BriefClaimPage />
    </App>
  );
};

describe('BriefClaimPage', () => {
  beforeEach(() => {
    mocks.claimBrief.mockReset();
    mocks.replace.mockReset();
    mocks.removePublicBriefToken.mockReset();
    mocks.getPublicBriefToken.mockReset();
    mocks.session = { data: { user: { group: GROUPS.client } }, status: 'authenticated' };
  });

  it('redirects to brief detail on 404 (already claimed)', async () => {
    mocks.claimBrief.mockReturnValue({ unwrap: () => Promise.reject({ status: 404 }) });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');
    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('brief-123'));
    expect(mocks.replace).not.toHaveBeenCalledWith(expect.stringContaining('dashboard'));
  });

  it('redirects to dashboard on generic error', async () => {
    mocks.claimBrief.mockReturnValue({ unwrap: () => Promise.reject({ status: 500 }) });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');
    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('dashboard'));
  });

  it('shows email-mismatch screen on 403 (no auto-redirect)', async () => {
    mocks.claimBrief.mockReturnValue({ unwrap: () => Promise.reject({ status: 403 }) });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');
    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.removePublicBriefToken).toHaveBeenCalledWith('brief-123');
    expect(mocks.replace).not.toHaveBeenCalledWith(expect.stringContaining('dashboard'));
  });

  it('redirects to brief detail on success', async () => {
    mocks.claimBrief.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'brief-123' }) });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');
    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('brief-123'));
  });

  it('shows no-access screen for a non-client (vendor) without claiming', async () => {
    mocks.session = { data: { user: { group: GROUPS.vendor } }, status: 'authenticated' };

    renderPage('test-token');
    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.claimBrief).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(screen.getByText(/no access/i)).toBeTruthy();
  });
});
