import logger from '@/lib/logger';
import { ApiPathname, ApiRoute } from '@/constants/apiRoute';
import { User } from '@/types/user.interface';
import { createHmacSHA256 } from '@/lib/hmac';

interface UserSession {
  userId: string;
  userGroup: string;
}

/**
 * Получение пользователя.
 * @returns Promise<User>
 */
export const updateUserSession = async ({ userId, userGroup }: UserSession): Promise<User> => {
  const requestHeaders = new Headers();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-user-group', userGroup);
  requestHeaders.set('x-timestamp', timestamp);

  try {
    // Создаем HMAC подпись
    const method = 'GET';
    const stringToSign = `${method}:${ApiPathname.USER_INFO}:${timestamp}:${userId}:${userGroup}`;
    const signature = await createHmacSHA256(stringToSign);
    requestHeaders.set('x-signature', signature);

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
