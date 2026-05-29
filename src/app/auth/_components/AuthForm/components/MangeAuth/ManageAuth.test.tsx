import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockSearchParams = { get: vi.fn() };

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/auth',
}));

const mockCheckEmail = vi.fn();

vi.mock('@/helpers/checkEmail', () => ({
  checkEmail: (...args: unknown[]) => mockCheckEmail(...args),
}));

vi.mock('./components/EmailForm/EmailForm', () => ({
  EmailForm: (props: { nextAction: (step: string, email: string) => void }) => (
    <div data-testid='email-form' onClick={() => props.nextAction('register', 'x@x.com')}>
      EmailForm
    </div>
  ),
}));

vi.mock('./components/RegisterForm/RegisterForm', () => ({
  RegisterForm: () => <div data-testid='register-form'>RegisterForm</div>,
}));

vi.mock('./components/PasswordForm/PasswordForm', () => ({
  PasswordForm: () => <div data-testid='password-form'>PasswordForm</div>,
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    message: {
      ...actual.message,
      useMessage: () => [{ info: vi.fn(), error: vi.fn() }, <span key='ctx' />],
    },
  };
});

import { ManageAuth } from './ManageAuth';

describe('ManageAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.get.mockReturnValue(null);
  });

  it('renders EmailForm when no email query param', () => {
    render(<ManageAuth />);
    expect(screen.getByTestId('email-form')).toBeInTheDocument();
  });

  it('goes to register step when email not exists', async () => {
    mockSearchParams.get.mockReturnValue('new@example.com');
    mockCheckEmail.mockResolvedValue({ exists: false, authType: 'CREDENTIALS' });

    render(<ManageAuth />);

    await waitFor(() => {
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });
    expect(mockCheckEmail).toHaveBeenCalledWith('new@example.com');
  });

  it('goes to signin step when email exists with credentials', async () => {
    mockSearchParams.get.mockReturnValue('existing@example.com');
    mockCheckEmail.mockResolvedValue({ exists: true, authType: 'CREDENTIALS' });

    render(<ManageAuth />);

    await waitFor(() => {
      expect(screen.getByTestId('password-form')).toBeInTheDocument();
    });
  });

  it('stays on EmailForm when email exists with google', async () => {
    mockSearchParams.get.mockReturnValue('google@example.com');
    mockCheckEmail.mockResolvedValue({ exists: true, authType: 'GOOGLE' });

    render(<ManageAuth />);

    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalledWith('google@example.com');
    });
    await waitFor(() => {
      expect(screen.getByTestId('email-form')).toBeInTheDocument();
    });
  });

  it('stays on EmailForm when checkEmail throws', async () => {
    mockSearchParams.get.mockReturnValue('fail@example.com');
    mockCheckEmail.mockRejectedValue(new Error('network error'));

    render(<ManageAuth />);

    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalledWith('fail@example.com');
    });
    await waitFor(() => {
      expect(screen.getByTestId('email-form')).toBeInTheDocument();
    });
  });
});
