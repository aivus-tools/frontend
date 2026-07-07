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
    // The component calls the mutation as `send({...}).unwrap()`, so the mock must
    // return an object with an unwrap() — a plain resolved value would throw and
    // silently route the "success" tests through the catch branch.
    mocks.sendPublic.mockReturnValue({ unwrap: () => Promise.resolve({ ok: true, finalizingTaskId: null }) });
    mocks.sendClient.mockReturnValue({ unwrap: () => Promise.resolve({ ok: true, finalizingTaskId: null }) });
  });

  it('does not render email field for anon by default (email comes from chat)', () => {
    renderModal();
    expect(screen.queryByPlaceholderText('email@example.com')).toBeNull();
  });

  it('does not render email field for authenticated user', () => {
    renderModal({ isAnon: false });
    expect(screen.queryByPlaceholderText('email@example.com')).toBeNull();
  });

  it('calls sendPublic with empty email for anon (server falls back to stored)', async () => {
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(mocks.sendPublic).toHaveBeenCalledWith(expect.objectContaining({ email: '', slug: 'test-agency' }));
    });
  });

  it('reveals the email field as a fallback when server reports email_required', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'email_required' } }),
    });
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('email@example.com')).toBeTruthy();
    });
  });

  it('sends the typed email after the fallback field appears', async () => {
    mocks.sendPublic.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'email_required' } }),
    });
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    const input = await screen.findByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(mocks.sendPublic).toHaveBeenLastCalledWith(
        expect.objectContaining({ email: 'test@example.com', slug: 'test-agency' })
      );
    });
  });

  it('closes and calls onSuccess when the send resolves without a finalizing task', async () => {
    const onSuccess = vi.fn();
    const onChange = vi.fn();
    renderModal({ onSuccess, onChange });
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  it('does not submit an empty revealed fallback email (required rule blocks it)', async () => {
    mocks.sendPublic.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'email_required' } }),
    });
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await screen.findByPlaceholderText('email@example.com');
    mocks.sendPublic.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeTruthy();
    });
    expect(mocks.sendPublic).not.toHaveBeenCalled();
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
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
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(
      () => {
        expect(screen.getByText('Sending failed. Please try again.')).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });

  it('reveals the email field as a fallback when server reports invalid_email', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'invalid_email' } }),
    });
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('email@example.com')).toBeTruthy();
    });
  });

  it('does not reveal the email field for anon on a non-email error', async () => {
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 409, data: { code: 'already_sent' } }),
    });
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('This brief was already sent to this vendor.')).toBeTruthy();
    });
    expect(screen.queryByPlaceholderText('email@example.com')).toBeNull();
  });

  it('keeps the fallback email field visible after a subsequent non-email error', async () => {
    mocks.sendPublic.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'email_required' } }),
    });
    mocks.sendPublic.mockReturnValue({
      unwrap: () => Promise.reject({ status: 409, data: { code: 'already_sent' } }),
    });
    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    const input = await screen.findByPlaceholderText('email@example.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('This brief was already sent to this vendor.')).toBeTruthy();
    });
    expect(screen.queryByPlaceholderText('email@example.com')).not.toBeNull();
  });

  it('does not reveal the email field for authenticated user even when the server returns email_required', async () => {
    mocks.sendClient.mockReturnValue({
      unwrap: () => Promise.reject({ status: 400, data: { code: 'email_required' } }),
    });
    renderModal({ isAnon: false });
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(screen.getByText('Please provide a valid email address.')).toBeTruthy();
    });
    expect(screen.queryByPlaceholderText('email@example.com')).toBeNull();
  });

  it('authenticated send calls sendClient without any email field', async () => {
    renderModal({ isAnon: false });
    await act(async () => {
      fireEvent.click(screen.getByText('Send brief'));
    });
    await waitFor(() => {
      expect(mocks.sendClient).toHaveBeenCalledWith(expect.not.objectContaining({ email: expect.anything() }));
      expect(mocks.sendPublic).not.toHaveBeenCalled();
    });
  });
});
