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
  getPublicStatus: vi.fn(),
  getAuthStatus: vi.fn(),
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useSendPublicBriefToVendorMutation: () => [mocks.sendPublic, {}],
  useSendClientBriefToVendorMutation: () => [mocks.sendClient, {}],
  useLazyGetPublicBriefStatusQuery: () => [mocks.getPublicStatus, {}],
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useLazyGetBriefAiStatusQuery: () => [mocks.getAuthStatus, {}],
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
    mocks.sendPublic.mockClear();
    mocks.sendClient.mockClear();
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

  it('does not call sendPublic when isAnon=true but token=null', async () => {
    renderModal({ isAnon: true, token: null });
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(mocks.sendPublic).not.toHaveBeenCalled();
      expect(mocks.sendClient).not.toHaveBeenCalled();
    });
  });

  it('shows already-sent error message on code=already_sent', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 409, data: { code: 'already_sent' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('This brief was already sent to this vendor.')).toBeTruthy();
    });
  });

  it('shows still-generating error message on code=still_generating', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 409, data: { code: 'still_generating' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('The brief is still being prepared. Try again in a moment.')).toBeTruthy();
    });
  });

  it('shows still-generating error message on code=already_being_sent', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 409, data: { code: 'already_being_sent' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('The brief is still being prepared. Try again in a moment.')).toBeTruthy();
    });
  });

  it('shows not-ready error message on code=not_ready', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'not_ready' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('The brief is not ready to send yet.')).toBeTruthy();
    });
  });

  it('shows invalid-email error message on code=invalid_email', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'invalid_email' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('Please provide a valid email address.')).toBeTruthy();
    });
  });

  it('shows no-agency error message on code=agency_not_found', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 404, data: { code: 'agency_not_found' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('This agency is no longer accepting briefs.')).toBeTruthy();
    });
  });

  it('shows generic error message on code=vendor_mismatch', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'vendor_mismatch' } }),
    });
    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('Failed to send. Please try again.')).toBeTruthy();
    });
  });

  it('shows failed-task error message when poll returns status=failed', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.resolve({ ok: true, finalizingTaskId: 'task-1' }),
    });
    mocks.getPublicStatus.mockReturnValue({
      unwrap: () => Promise.resolve({ status: 'failed', result: null, error: null }),
    });

    renderModal();
    const input = screen.getByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(
      () => {
        expect(screen.getByText('Sending failed. Please try again.')).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });
});
