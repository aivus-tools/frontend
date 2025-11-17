import logger from '@/lib/logger';
import { ApiRoute } from '@/constants/apiRoute';
import { AuthType, Groups } from '@/types/user.interface.';

type Credentials = Partial<Record<'email' | 'password', unknown>> & { authType: AuthType };
/**
 * Аутентификация пользователя.
 * @returns Данные пользователя
 */
export async function login(credentials: Credentials): Promise<{
  id: string;
  name: string;
  email: string;
  group: Groups;
}> {
  try {
    const response = await fetch(ApiRoute.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiRoute.LOGIN}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error login:', error);
    throw error;
  }
}

/**
 * Регистрация пользователя.
 * @returns Данные пользователя
 */
export async function register({
  name,
  email,
  authType,
  password,
}: {
  name: string;
  email: string;
  authType: AuthType;
  password?: string;
}): Promise<{
  message: string;
  group?: Groups;
  id: string;
}> {
  try {
    logger.info('Registering user:', { name, email, authType, password });
    const response = await fetch(ApiRoute.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        authType,
        password,
      }),
    });
    logger.info('Register response:', response);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiRoute.LOGIN}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error register:', error);
    throw error;
  }
}

/**
 * Проверяет существует ли пользователь с таким email.
 * @returns boolean
 */
export async function checkEmail({ email }: { email: string }): Promise<{
  exists: boolean;
  authType: AuthType;
}> {
  try {
    const response = await fetch(ApiRoute.CHECK_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiRoute.CHECK_EMAIL}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error fetching:', error);
    throw error;
  }
}

/**
 * Меняет роль пользователя.
 * @returns boolean
 */
export async function changeRole(id: string, newGroup: Groups): Promise<boolean> {
  try {
    const res = await fetch(ApiRoute.CHANGE_ROLE(id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newGroup }),
    });
    if (!res.ok) {
      const message = await res.json();
      throw new Error(`Failed to fetch ${ApiRoute.CHANGE_ROLE(id)}: ${res.statusText} ${message}`);
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
    const response = await fetch(ApiRoute.RESEND_CONFIRMATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${ApiRoute.RESEND_CONFIRMATION}: ${response.statusText}`);
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
    const response = await fetch(ApiRoute.FORGOT_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || `Failed to fetch ${ApiRoute.FORGOT_PASSWORD}: ${response.statusText}`);
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
    const response = await fetch(`${ApiRoute.RESET_PASSWORD}?token=${encodedToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || `Failed to fetch ${ApiRoute.RESET_PASSWORD}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error resetting password:', error);
    throw error;
  }
}