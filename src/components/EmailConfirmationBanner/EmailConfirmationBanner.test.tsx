import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
  resend: vi.fn(),
  session: { data: { user: { email: 'a@a.aa', emailConfirmedAt: null } } } as {
    data: { user: { email?: string; emailConfirmedAt?: string | null } } | null;
  },
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.session,
}));

vi.mock('@/services/client/userApi', () => ({
  useResendConfirmationMutation: () => [mocks.resend, { isLoading: false }],
}));

vi.mock('@/lib/i18n', () => ({
  t: (key: string) => key,
}));

import { EmailConfirmationBanner } from './EmailConfirmationBanner';

describe('EmailConfirmationBanner', () => {
  beforeEach(() => {
    mocks.resend.mockReset();
    mocks.resend.mockReturnValue({ unwrap: () => Promise.resolve({ message: 'ok' }) });
    mocks.session = { data: { user: { email: 'a@a.aa', emailConfirmedAt: null } } };
  });

  it('renders the nag when email is not confirmed', () => {
    render(<EmailConfirmationBanner />);
    expect(screen.getByText('EMAIL_NOT_CONFIRMED_BANNER')).toBeInTheDocument();
  });

  it('resends confirmation on click', async () => {
    render(<EmailConfirmationBanner />);
    fireEvent.click(screen.getByText('RESEND'));
    await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith('a@a.aa'));
  });

  it('renders nothing once the email is confirmed', () => {
    mocks.session = {
      data: { user: { email: 'a@a.aa', emailConfirmedAt: '2026-06-18T00:00:00Z' } },
    };
    const { container } = render(<EmailConfirmationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no session email', () => {
    mocks.session = { data: { user: { emailConfirmedAt: null } } };
    const { container } = render(<EmailConfirmationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when confirmation status is unknown (stale token, undefined)', () => {
    mocks.session = { data: { user: { email: 'a@a.aa' } } };
    const { container } = render(<EmailConfirmationBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
