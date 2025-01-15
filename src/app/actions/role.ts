'use server';

import { redirect } from 'next/navigation';
import { createSession, getSessionInfo } from '../lib/session';
import { routes } from '@/service-routes';
import { Roles } from '@/services/types';

export async function role(newRole: Roles) {
	try {
		const { id } = await getSessionInfo();

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
		await createSession(newRole, id);
		redirect('/app/dashboard');
	} catch (e) {
		console.error('Failed to change role', e);
	}
}
