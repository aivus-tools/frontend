'use client';

import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
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
  claimBrief: vi.fn(),
  replace: vi.fn(),
  removePublicBriefToken: vi.fn(),
  getPublicBriefToken: vi.fn(),
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
  it('redirects to brief detail on 404 (already claimed)', async () => {
    mocks.claimBrief.mockReturnValue({
      unwrap: () => Promise.reject({ status: 404 }),
    });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');

    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('brief-123'));
    expect(mocks.replace).not.toHaveBeenCalledWith(expect.stringContaining('dashboard'));
  });

  it('redirects to dashboard on generic error', async () => {
    mocks.claimBrief.mockReturnValue({
      unwrap: () => Promise.reject({ status: 500 }),
    });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');

    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('dashboard'));
  });

  it('redirects to dashboard with warning on 403 (email mismatch)', async () => {
    mocks.claimBrief.mockReturnValue({
      unwrap: () => Promise.reject({ status: 403 }),
    });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');

    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('dashboard'));
    expect(mocks.removePublicBriefToken).toHaveBeenCalledWith('brief-123');
  });

  it('redirects to brief detail on success', async () => {
    mocks.claimBrief.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'brief-123' }),
    });
    mocks.getPublicBriefToken.mockReturnValue(null);

    renderPage('test-token');

    await new Promise((x) => setTimeout(x, 50));

    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('brief-123'));
  });
});
