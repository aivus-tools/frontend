import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { auth } from '@/auth';
import { changeRole } from '@/services/authService';
import { invalidateUserCache } from '@/services/revalidate';
import { Roles } from '@/types/user';

export async function POST(req: Request) {
	try {
		const body: { group: Roles } | null = await req.json();
		const session = await auth();
		const { id } = session?.user ?? {};
		if (!id) {
			logger.error('No user id');
			NextResponse.json({ error: 'No user session' }, { status: 400 });
			return;
		}
		if (!body) {
			logger.error('No body');
			NextResponse.json({ error: 'No group' }, { status: 400 });
			return;
		}
		const ok = await changeRole(id, body.group);
		if (!ok) {
			logger.error('Failed to change role');
			NextResponse.json({ error: 'Failed to change role' }, { status: 500 });
			return;
		}
		invalidateUserCache();
		NextResponse.redirect('/app/dashboard');
	} catch (error) {
		logger.error('Ошибка обработки запроса:', error);
		return NextResponse.json({ error: 'Bad request' }, { status: 500 });
	}
}
