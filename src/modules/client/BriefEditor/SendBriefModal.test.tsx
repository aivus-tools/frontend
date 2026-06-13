import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
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
  sendPublic: vi.fn(),
  sendClient: vi.fn(),
  getStatus: vi.fn(),
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useSendPublicBriefToVendorMutation: () => [mocks.sendPublic, {}],
  useSendClientBriefToVendorMutation: () => [mocks.sendClient, {}],
  useLazyGetPublicBriefStatusQuery: () => [mocks.getStatus, {}],
}));

import { SendBriefModal } from './SendBriefModal';

const renderModal = (overrides: Partial<React.ComponentProps<typeof SendBriefModal>> = {}) =>
  render(
    <App>
      <SendBriefModal
        value={true}
        onChange={vi.fn()}
        briefId='brief-1'
        slug='test-agency'
        vendorName='Test Agency'
        isAnon={true}
        token='tok-1'
        onSuccess={vi.fn()}
        {...overrides}
      />
    </App>
  );

describe('SendBriefModal', () => {
  beforeEach(() => {
    mocks.sendPublic.mockResolvedValue({ data: { ok: true, finalizingTaskId: null } });
    mocks.sendClient.mockResolvedValue({ data: { ok: true, finalizingTaskId: null } });
  });

  it('renders email field for anon', () => {
    renderModal();
    expect(screen.getByPlaceholderText('email@example.com')).toBeTruthy();
  });

  it('does not render email field for authenticated user', () => {
    renderModal({ isAnon: false });
    expect(screen.queryByPlaceholderText('email@example.com')).toBeNull();
  });

  it('validates email required on submit', async () => {
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeTruthy();
    });
  });

  it('calls sendPublic with email for anon', async () => {
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(mocks.sendPublic).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com', slug: 'test-agency' })
      );
    });
  });

  it('calls sendClient for authenticated user', async () => {
    renderModal({ isAnon: false });
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(mocks.sendClient).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'test-agency', briefId: 'brief-1' })
      );
    });
  });
});
