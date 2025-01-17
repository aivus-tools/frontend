import { routes } from '@/lib/service-routes';
import { User } from '@/types/user';

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
export async function fetchUserByEmail(email: string): Promise<User> {
	try {
		const response = await fetch(routes.getUserByEmail(email));
		if (!response.ok) {
			throw new Error(`Failed to fetch users: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
}
