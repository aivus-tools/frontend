import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn<() => Promise<{ error: string | null; ok: boolean; status: number; url: string | null }>>(),
  getPendingBrief: vi.fn<() => { briefId: string; token: string } | null>(() => null),
  clearPendingBrief: vi.fn(),
  consumeAuthReturnUrl: vi.fn<() => string | null>(() => null),
}));

vi.mock('next-auth/react', () => ({
  signIn: mocks.signIn,
}));

vi.mock('@/helpers/pendingBrief', () => ({
  getPendingBrief: mocks.getPendingBrief,
  clearPendingBrief: mocks.clearPendingBrief,
  consumeAuthReturnUrl: mocks.consumeAuthReturnUrl,
}));

vi.mock('@/constants/apiRoute', () => ({
  CALLBACK_URL: '/app/dashboard',
}));

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

const locationAssignSpy = vi.fn();
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

Object.defineProperty(window.location, 'href', {
  set: locationAssignSpy,
  get: () => '',
  configurable: true,
});

import { PasswordForm } from './PasswordForm';

const renderForm = () =>
  render(
    <App>
      <PasswordForm email='user@example.com' prevStepAction={vi.fn()} />
    </App>
  );

describe('PasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });
    mocks.getPendingBrief.mockReturnValue(null);
    mocks.consumeAuthReturnUrl.mockReturnValue(null);
  });

  it('renders password input and sign in button', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('redirects to claim page with token when pending brief exists', async () => {
    mocks.getPendingBrief.mockReturnValue({ briefId: 'brief-123', token: 'tok-abc' });
    mocks.signIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });

    renderForm();
    const input = screen.getByPlaceholderText('Enter your password');
    await userEvent.type(input, 'mypassword');
    await userEvent.click(screen.getByText('Sign in'));

    expect(locationAssignSpy).toHaveBeenCalledWith(expect.stringContaining('/app/brief/claim/brief-123'));
    expect(locationAssignSpy).toHaveBeenCalledWith(expect.stringContaining('token=tok-abc'));
  });

  it('redirects to returnUrl when no pending brief', async () => {
    mocks.consumeAuthReturnUrl.mockReturnValue('/brief/acme');
    mocks.signIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });

    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'mypassword');
    await userEvent.click(screen.getByText('Sign in'));

    expect(locationAssignSpy).toHaveBeenCalledWith('/brief/acme');
  });

  it('shows error message on invalid credentials', async () => {
    mocks.signIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null });

    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass');
    await userEvent.click(screen.getByText('Sign in'));

    expect(locationAssignSpy).not.toHaveBeenCalled();
  });
});
