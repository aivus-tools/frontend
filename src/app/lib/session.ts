import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { User, Roles } from '@/services/types';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const SESSION = 'SESSION';

type SessionPayload = Pick<User, 'id' | 'role'> & { expiresAt: Date };

export async function encrypt(payload: SessionPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ['HS256'],
		});
		return payload;
	} catch (e) {
		console.error('Failed to verify session', e);
		await deleteSession();
	}
}

export async function createSession(role: Roles, id: number) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const session = await encrypt({ id, role, expiresAt });
	const cookieStore = await cookies();

	cookieStore.set(SESSION, session, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	});
}

export async function getSessionInfo() {
	const cookie = (await cookies()).get(SESSION)?.value;
	const session = (await decrypt(cookie)) as SessionPayload | undefined;
	if (!session) return {};
	const { id, role } = session;
	return { id, role };
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION);
}
