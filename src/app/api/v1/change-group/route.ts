import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { auth } from '@/auth';
import { changeRole } from '@/services/authService';
// import { invalidateUserCache } from '@/services/revalidate';
import { Groups } from '@/types/user';

export async function POST(req: Request) {
	try {
		const body: { group: Groups } | null = await req.json();
		const session = await auth();
		const { id } = session?.user ?? {};
		if (!id) {
			logger.error('No user id');
			NextResponse.json({ message: 'No user session' }, { status: 400 });
			return;
		}
		if (!body) {
			logger.error('No body');
			NextResponse.json({ message: 'No group' }, { status: 400 });
			return;
		}
		const ok = await changeRole(id, body.group);
		if (!ok) {
			logger.error('Failed to change role');
			NextResponse.json({ message: 'Failed to change role' }, { status: 500 });
			return;
		}
		// invalidateUserCache();
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	} catch (error) {
		logger.error('Ошибка обработки запроса:', error);
		return NextResponse.json({ message: 'Bad request', error }, { status: 500 });
	}
}
