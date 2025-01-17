'use server';

import { redirect } from 'next/navigation';
import { Roles } from '@/types/user';
import { auth } from '@/auth';
import { changeRole } from '@/services/authService';

export async function role(newRole: Roles) {
	try {
		const session = await auth();
		const { id } = session?.user ?? {};

		if (!id) {
			console.error('No user id');
			return;
		}
		const ok = await changeRole(id, newRole);
		if (!ok) {
			console.error('Failed to change role');
			return;
		}
		redirect('/app/dashboard');
	} catch (e) {
		console.error('Failed to change role', e);
	}
}
