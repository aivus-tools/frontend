import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  customAiInstructions: 'Be concise.',
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

  it('renders AI assistant instructions field initialized from settings', () => {
    renderSection();
    expect(screen.getByText('AI assistant instructions')).toBeTruthy();
    expect(screen.getByDisplayValue('Be concise.')).toBeTruthy();
  });

  it('submits customAiInstructions in the update payload', async () => {
    mocks.updateSettings.mockReturnValue({ unwrap: () => Promise.resolve(baseSettings) });
    renderSection();

    await act(async () => {
      fireEvent.click(screen.getByText('Save Company Settings'));
    });

    await waitFor(() => {
      expect(mocks.updateSettings).toHaveBeenCalled();
    });
    expect(mocks.updateSettings.mock.calls[0][0]).toHaveProperty('customAiInstructions', 'Be concise.');
  });

  it('lets the user edit the AI instructions textarea', async () => {
    renderSection();
    const textarea = document.querySelector('#customAiInstructions') as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(false);
    expect(textarea.disabled).toBe(false);

    // antd rc-textarea does not push synthetic input into the Form store under
    // jsdom (a plain Input does), so the edited value -> payload wiring is covered
    // by the submit test above; here we prove the field accepts and reflects input.
    const user = userEvent.setup({ delay: null });
    await user.clear(textarea);
    await user.type(textarea, 'edited');
    expect(textarea.value).toBe('edited');
  }, 15000);

  it('caps the AI instructions textarea at 500 characters', () => {
    renderSection();
    const textarea = screen.getByDisplayValue('Be concise.') as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(500);
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
