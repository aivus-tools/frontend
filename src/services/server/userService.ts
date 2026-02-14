import logger from '@/lib/logger';
import { ApiPathname } from '@/constants/apiRoute';
import { User } from '@/types/user.interface';
import { createHmacSHA256 } from '@/lib/hmac';

const API_URL = process.env.API_URL || 'http://localhost:8000';

interface UserSession {
  userId: string;
  userGroup: string;
}

/**
 * Fetch user session data.
 * @returns Promise<User>
 */
export const updateUserSession = async ({ userId, userGroup }: UserSession): Promise<User> => {
  const requestHeaders = new Headers();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-user-group', userGroup);
  requestHeaders.set('x-timestamp', timestamp);

  try {
    // Create HMAC signature
    const method = 'GET';
    const stringToSign = `${method}:${ApiPathname.USER_INFO}:${timestamp}:${userId}:${userGroup}`;
    const signature = await createHmacSHA256(stringToSign);
    requestHeaders.set('x-signature', signature);

    const response = await fetch(`${API_URL}${ApiPathname.USER_INFO}`, {
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
