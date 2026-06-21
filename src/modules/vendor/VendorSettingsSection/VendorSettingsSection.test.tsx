import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
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
  updateSettings: vi.fn(),
  uploadLogo: vi.fn(),
  suggestSlug: vi.fn(),
  checkSlug: vi.fn(),
  getWebhookKey: vi.fn(),
  rotateWebhookKey: vi.fn(),
}));

vi.mock('@/services/client/vendorSettingsApi', () => ({
  useGetVendorSettingsQuery: mocks.getSettings,
  useUpdateVendorSettingsMutation: () => [mocks.updateSettings, { isLoading: false }],
  useUploadVendorLogoMutation: () => [mocks.uploadLogo, { isLoading: false }],
  useLazySuggestVendorSlugQuery: () => [mocks.suggestSlug, {}],
  useLazyCheckVendorSlugQuery: () => [mocks.checkSlug, {}],
  useGetVendorWebhookKeyQuery: mocks.getWebhookKey,
  useRotateVendorWebhookKeyMutation: () => [mocks.rotateWebhookKey, { isLoading: false }],
}));

import { VendorSettingsSection } from './VendorSettingsSection';

const baseSettings = {
  id: '1',
  vendorId: 'v1',
  logoUrl: null,
  companyName: 'Acme',
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
  slug: 'acme-films',
  leadNotificationEmail: 'test@acme.com',
};

const renderSection = () =>
  render(
    <App>
      <VendorSettingsSection />
    </App>
  );

describe('VendorSettingsSection', () => {
  beforeEach(() => {
    mocks.getSettings.mockReturnValue({ data: baseSettings, isLoading: false });
    mocks.getWebhookKey.mockReturnValue({ data: null, isLoading: false });
  });

  it('renders slug addon prefix from current host', () => {
    renderSection();
    expect(screen.getByText(`${window.location.host}/brief/`)).toBeTruthy();
  });

  it('renders Suggest button', () => {
    renderSection();
    expect(screen.getByText('Suggest')).toBeTruthy();
  });

  it('renders lead notification email field', () => {
    renderSection();
    expect(screen.getByText('Lead notification email')).toBeTruthy();
  });

  it('does not call updateSettings when slug is taken (validates after suggest)', async () => {
    mocks.checkSlug.mockReturnValue({ unwrap: () => Promise.resolve({ available: false }) });
    mocks.suggestSlug.mockReturnValue({ unwrap: () => Promise.resolve({ slug: 'existing-slug' }) });
    renderSection();

    await act(async () => {
      fireEvent.click(screen.getByText('Suggest'));
    });

    await waitFor(() => {
      expect(screen.queryByText('This link is taken.')).toBeTruthy();
    });

    mocks.updateSettings.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByText('Save Company Settings'));
    });

    expect(mocks.updateSettings).not.toHaveBeenCalled();
  });
});
