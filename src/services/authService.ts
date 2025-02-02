import logger from '@/lib/logger';
import { routes } from '@/lib/service-routes';
import { Roles, User } from '@/types/user';

const PASSWORD = '123';

/**
 * Аутентификация пользователя.
 * @returns Данные пользователя
 */
export async function login(credentials: Partial<Record<'email' | 'password', unknown>>): Promise<User> {
	try {
		const response = await fetch(routes.LOGIN, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(credentials),
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch ${routes.LOGIN}: ${response.statusText}`);
		}
		const data = await response.json();
		return data;
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
}: {
	name: string;
	email: string;
	authType: 'CREDENTIALS' | 'GOOGLE';
}): Promise<boolean> {
	try {
		const response = await fetch(routes.REGISTER, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				name,
				password: PASSWORD,
				authType,
			}),
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch ${routes.LOGIN}: ${response.statusText}`);
		}
		return true;
	} catch (error) {
		logger.error('Error register:', error);
		throw error;
	}
}

/**
 * Проверяет существует ли пользователь с таким email.
 * @returns boolean
 */
export async function checkEmail({ email }: { email: string }): Promise<boolean> {
	console.log('checkEmail', email);
	try {
		const response = await fetch(routes.CHECK_EMAIL, {
			method: 'POST',
			body: JSON.stringify({ email }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch ${routes.CHECK_EMAIL}: ${response.statusText}`);
		}
		const data: { exist: boolean } = await response.json();
		return data.exist;
	} catch (error) {
		logger.error('Error fetching:', error);
		throw error;
	}
}

/**
 * Меняет роль пользователя.
 * @returns boolean
 */
export async function changeRole(id: string, newRole: Roles): Promise<boolean> {
	try {
		const response = await fetch(routes.changeRole(id), {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ newRole }),
		});
		return response.ok;
	} catch (error) {
		logger.error('Error changing role:', error);
		throw error;
	}
}
