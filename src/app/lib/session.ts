import 'server-only';
import { cookies } from 'next/headers';
import { Roles } from '@/services/types';

export async function createSession(role: Roles, id: string | number) {
	const cookieStore = await cookies();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day expiration
	cookieStore.set('role', role, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	});
	cookieStore.set('userId', `${id}`, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	});
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete('userId');
	cookieStore.delete('role');
}
