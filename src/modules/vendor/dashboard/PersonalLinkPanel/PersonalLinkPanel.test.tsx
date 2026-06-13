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
  getSettings: vi.fn(),
}));

vi.mock('@/services/client/vendorSettingsApi', () => ({
  useGetVendorSettingsQuery: mocks.getSettings,
  useLazySuggestVendorSlugQuery: () => [vi.fn(), {}],
  useGetVendorWebhookKeyQuery: () => ({ data: null, isLoading: false }),
  useRotateVendorWebhookKeyMutation: () => [vi.fn(), {}],
  useUpdateVendorSettingsMutation: () => [vi.fn(), {}],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { PersonalLinkPanel } from './PersonalLinkPanel';

const baseSettings = {
  id: '1',
  vendorId: 'v1',
  logoUrl: null,
  companyName: 'Acme Films',
  agencyName: '',
  fringesPercent: '0',
  handlingPercent: '0',
  markupPercent: '0',
  productionInsurancePercent: '0',
  productionFeePercent: '0',
  postMarkupPercent: '0',
  postInsurancePercent: '0',
  postTaxPercent: '0',
  updatedAt: '',
  slug: null,
  leadNotificationEmail: '',
};

const renderPanel = () =>
  render(
    <App>
      <PersonalLinkPanel />
    </App>
  );

describe('PersonalLinkPanel', () => {
  beforeEach(() => {
    mocks.getSettings.mockReturnValue({
      data: { ...baseSettings, slug: 'acme-films' },
      isLoading: false,
    });
  });

  it('shows brief URL when slug is set', () => {
    renderPanel();
    expect(screen.getByText(/acme-films/)).toBeTruthy();
  });

  it('shows Copy and Preview buttons', () => {
    renderPanel();
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.getByText('Preview')).toBeTruthy();
    expect(screen.getByText('Embed')).toBeTruthy();
  });

  it('shows empty state when no slug', () => {
    mocks.getSettings.mockReturnValue({
      data: { ...baseSettings, slug: null },
      isLoading: false,
    });
    renderPanel();
    expect(screen.getByText('Set up your brief link')).toBeTruthy();
  });

  it('renders nothing visible while loading', () => {
    mocks.getSettings.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    renderPanel();
    expect(screen.queryByText('Your brief link')).toBeNull();
    expect(screen.queryByText('Set up your brief link')).toBeNull();
  });
});
