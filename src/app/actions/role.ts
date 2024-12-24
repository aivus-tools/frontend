'use server';

import { redirect } from 'next/navigation';
import { createSession } from '../lib/session';
import { routes } from '@/service-routes';
import { Roles } from '@/services/types';
import { cookies } from 'next/headers';

export async function role(newRole: Roles) {
	const id = (await cookies()).get('userId')?.value;
	if (!id) {
		console.error('No user id');
		return;
	}
	const result = await fetch(routes.changeRole(id), {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ newRole }),
	});
	if (!result.ok) {
		console.error('Failed to change role');
		result.json().then(console.error);
		return;
	}
	await createSession(newRole, 'userId');
	redirect('/app/dashboard');
}
