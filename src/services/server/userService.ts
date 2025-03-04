import logger from '@/lib/logger';
import { User } from '@/types/user';

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
		const response = await fetch('/api/v1/users/me', {
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
