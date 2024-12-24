'use server';

import { signOut } from '@/auth';
import { deleteSession } from '../lib/session';

export async function logout() {
	await deleteSession();
	await signOut({ redirectTo: '/auth' });
}
