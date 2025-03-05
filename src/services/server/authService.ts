import logger from '@/lib/logger';
import { routes } from '@/lib/service-routes';
import { AuthType, Groups } from '@/types/user';

type Credentials = Partial<Record<'email' | 'password', unknown>> & { authType: AuthType };
/**
 * Аутентификация пользователя.
 * @returns Данные пользователя
 */
export async function login(credentials: Credentials): Promise<{
	id: number;
	name: string;
	email: string;
	group: Groups;
}> {
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
	id: number;
}> {
	try {
		logger.info('Registering user:', { name, email, authType, password });
		const response = await fetch(routes.REGISTER, {
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
			throw new Error(`Failed to fetch ${routes.LOGIN}: ${response.statusText}`);
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
export async function checkEmail({ email }: { email: string }): Promise<boolean> {
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
export async function changeRole(id: string, newGroup: Groups): Promise<boolean> {
	try {
		const res = await fetch(routes.changeRole(id), {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ newGroup }),
		});
		if (!res.ok) {
			const message = await res.json();
			throw new Error(`Failed to fetch ${routes.changeRole(id)}: ${res.statusText} ${message}`);
		}
		return true;
	} catch (error) {
		logger.error('Error changing role:', error);
		throw error;
	}
}
