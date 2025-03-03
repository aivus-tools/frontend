import { createHmacSHA256 } from '@/lib/hmac';
import logger from '@/lib/logger';
import { routes } from '@/lib/service-routes';
import { Groups, User } from '@/types/user';
import { URL } from 'url';

interface UserSession {
	email: string;
	userId: string;
	userGroup: Groups;
}

/**
 * Получение пользователя по e-mail.
 * @returns Данные пользователя
 */
export const updateUserSession = async ({ email, userId, userGroup }: UserSession): Promise<User> => {
	if (!email || typeof email !== 'string') {
		throw new Error('Invalid email provided');
	}

	const timestamp = Math.floor(Date.now() / 1000).toString();
	const requestHeaders = new Headers();
	const method = 'GET';
	const path = routes.getUserByEmail(email);
	const stringToSign = `${method}:${new URL(path).pathname}:${timestamp}:${userId}:${userGroup}`;
	const signature = await createHmacSHA256(stringToSign);

	requestHeaders.set('x-timestamp', timestamp);
	requestHeaders.set('x-signature', signature);

	try {
		const response = await fetch(path, {
			method,
			headers: requestHeaders,
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user by email: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		logger.error('Error fetching user by email:', error);
		throw error;
	}
};
