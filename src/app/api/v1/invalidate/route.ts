import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { invalidateUserCache } from '@/services/revalidate';

export async function POST() {
	try {
		invalidateUserCache();
		return NextResponse.json({ message: 'User cache invalidated' });
	} catch (error) {
		logger.error('Ошибка обработки запроса:', error);
		return NextResponse.json({ message: 'Bad request', error }, { status: 500 });
	}
}
