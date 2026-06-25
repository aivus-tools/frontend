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

vi.mock('@/services/client/vendorSettingsApi', () => ({
  useGetVendorWebhookKeyQuery: () => ({ data: { key: 'WK-TEST' }, isLoading: false }),
  useRotateVendorWebhookKeyMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/hooks/usePublicAppOrigin', () => ({
  usePublicAppOrigin: () => 'https://app.example.com',
}));

import { EmbedWebhookModal } from './EmbedWebhookModal';

const renderModal = () =>
  render(
    <App>
      <EmbedWebhookModal value={true} onChange={vi.fn()} slug='acme-films' />
    </App>
  );

describe('EmbedWebhookModal', () => {
  it('embed snippet does not advertise microphone (voice is hidden in embed)', () => {
    renderModal();
    expect(screen.queryByDisplayValue(/allow="microphone"/)).toBeNull();
  });

  it('embed snippet points at the branded brief with embed flag', () => {
    renderModal();
    expect(screen.getByDisplayValue(/\/brief\/acme-films\?embed=1/)).toBeTruthy();
  });

  it('keeps the embed path primary and webhook docs under a developer section', () => {
    renderModal();
    expect(
      screen.getByText('This is all most vendors need - just paste this code into a page on your site.')
    ).toBeTruthy();
    expect(screen.getByText('For developers (optional)')).toBeTruthy();
  });
});
