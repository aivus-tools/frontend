import 'server-only';
import { cookies } from 'next/headers';

export async function createSession(userType: string) {
	const cookieStore = await cookies();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day expiration
	cookieStore.set('session', userType, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	});
}

export async function updateSession() {
	const userType = (await cookies()).get('session')?.value;

	if (!userType) {
		return null;
	}

	const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day expiration

	const cookieStore = await cookies();
	cookieStore.set('session', userType, {
		httpOnly: true,
		secure: true,
		expires: expires,
		sameSite: 'lax',
		path: '/',
	});
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete('session');
}
