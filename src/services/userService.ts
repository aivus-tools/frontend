import { routes } from '@/lib/service-routes';
import { User } from '@/types/user';
import { cache } from 'react';

/**
 * Получение списка пользователей.
 * @returns Массив пользователей
 */
export async function fetchUsers(): Promise<User[]> {
	try {
		const response = await fetch(routes.GET_USERS);
		if (!response.ok) {
			throw new Error(`Failed to fetch users: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
}

/**
 * Получение пользователя по e-mail.
 * @returns Данные пользователя
 */
export const fetchUserByEmail = cache(async (email: string): Promise<User> => {
	if (!email || typeof email !== 'string') {
		throw new Error('Invalid email provided');
	}

	try {
		const response = await fetch(routes.getUserByEmail(email), { cache: 'force-cache' });

		if (!response.ok) {
			throw new Error(`Failed to fetch user by email: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		throw error;
	}
});
