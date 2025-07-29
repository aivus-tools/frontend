import logger from '@/lib/logger';
import { ApiRoute } from '@/lib/apiRoute';
import { User } from '@/types/user.interface.';

interface UserSession {
  userId: string;
}

/**
 * Получение пользователя.
 * @returns Promise<User>
 */
export const updateUserSession = async ({ userId }: UserSession): Promise<User> => {
  const requestHeaders = new Headers();
  requestHeaders.set('x-user-id', userId);

  try {
    const response = await fetch(ApiRoute.USER_INFO, {
      method: 'GET',
      headers: requestHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};
