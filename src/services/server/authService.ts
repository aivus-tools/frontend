import logger from '@/lib/logger';
import { ApiPathname } from '@/constants/apiRoute';
import { AuthType, Groups } from '@/types/user.interface';

/** Backend base URL for server-side calls (Node.js cannot use relative URLs). */
const API_URL = process.env.API_URL || 'http://localhost:8000';
const INTERNAL_SECRET = process.env.HMAC_SECRET || '';

type Credentials = Partial<Record<'email' | 'password', unknown>> & {
  authType: AuthType;
  briefId?: string;
  briefToken?: string;
};
/**
 * Authenticate user.
 * @returns User data
 */
export async function login(credentials: Credentials): Promise<{
  id: string;
  name: string;
  email: string;
  group: Groups;
  vendorId?: string;
  clientId?: string;
  claimedBriefId?: string;
}> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (INTERNAL_SECRET) {
      headers['X-Internal-Secret'] = INTERNAL_SECRET;
    }
    const response = await fetch(`${API_URL}${ApiPathname.LOGIN}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiPathname.LOGIN}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error login:', error);
    throw error;
  }
}

/**
 * Register user.
 * @returns User data
 */
export async function register({
  name,
  email,
  authType,
  password,
  briefId,
  briefToken,
}: {
  name: string;
  email: string;
  authType: AuthType;
  password?: string;
  briefId?: string;
  briefToken?: string;
}): Promise<{
  message: string;
  group?: Groups;
  id: string;
  vendorId?: string;
  clientId?: string;
}> {
  try {
    logger.info('Registering user:', { name, email, authType });
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (INTERNAL_SECRET) {
      headers['X-Internal-Secret'] = INTERNAL_SECRET;
    }
    const response = await fetch(`${API_URL}${ApiPathname.REGISTER}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        name,
        authType,
        password,
        briefId,
        briefToken,
      }),
    });
    logger.info('Register response:', response);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiPathname.REGISTER}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error register:', error);
    throw error;
  }
}

/**
 * Check if a user with the given email exists.
 * @returns boolean
 */
export async function checkEmail({ email }: { email: string }): Promise<{
  exists: boolean;
  authType: AuthType;
}> {
  try {
    const response = await fetch(`${API_URL}${ApiPathname.CHECK_EMAIL}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiPathname.CHECK_EMAIL}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error fetching:', error);
    throw error;
  }
}

/**
 * Change user role.
 * @returns boolean
 */
export async function changeRole(id: string, newGroup: Groups): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}${ApiPathname.CHANGE_ROLE(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group: newGroup }),
    });
    if (!res.ok) {
      const message = await res.json();
      throw new Error(`Failed to fetch ${ApiPathname.CHANGE_ROLE(id)}: ${res.statusText} ${message}`);
    }
    return true;
  } catch (error) {
    logger.error('Error changing role:', error);
    throw error;
  }
}

/**
 * Resend email confirmation.
 * @returns Promise<{ message: string }>
 */
export async function resendConfirmation(email: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}${ApiPathname.RESEND_CONFIRMATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiPathname.RESEND_CONFIRMATION}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error resending confirmation:', error);
    throw error;
  }
}

/**
 * Request password reset email.
 * @returns Promise<{ message: string }>
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}${ApiPathname.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || `Failed to fetch ${ApiPathname.FORGOT_PASSWORD}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error requesting password reset:', error);
    throw error;
  }
}

/**
 * Reset password with token.
 * @returns Promise<{ message: string }>
 */
export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  try {
    const encodedToken = encodeURIComponent(token);
    const response = await fetch(`${API_URL}${ApiPathname.RESET_PASSWORD}?token=${encodedToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || `Failed to fetch ${ApiPathname.RESET_PASSWORD}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error resetting password:', error);
    throw error;
  }
}
