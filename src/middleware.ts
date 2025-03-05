import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { GROUPS } from './lib/constants';
import logger from './lib/logger';
import { createHmacSHA256 } from './lib/hmac';

const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');
const MOCK_ENDPOINTS = ['/api/v1/briefs'];
const validGroups = new Set<string | undefined>([GROUPS.client, GROUPS.vendor]);
const HMAC_SECRET = process.env.HMAC_SECRET;

export default auth(async (req) => {
	if (!HMAC_SECRET) {
		logger.error('HMAC_SECRET not set');
		return NextResponse.error();
	}

	if (req.nextUrl.pathname === '/') {
		logger.info('redirecting to /auth');
		return NextResponse.redirect(new URL('/auth', req.url));
	}
	const { id, group } = req.auth?.user ?? {};
	const { pathname, search } = req.nextUrl;

	if (pathname.startsWith('/service/')) {
		let newPathname = changePathname(pathname);
		if (search) {
			newPathname += search;
		}
		const headers = new Headers(req.headers);
		if (!newPathname.startsWith('/api/v1/auth/')) {
			const timestamp = Math.floor(Date.now() / 1000).toString();
			headers.set('x-timestamp', timestamp);
			headers.set('x-user-id', id ?? '');
			headers.set('x-user-group', group ?? '');

			const method = req.method;
			const stringToSign = `${method}:${newPathname}:${timestamp}:${id}:${group}`;
			const computedSignature = await createHmacSHA256(stringToSign);
			headers.set('x-signature', computedSignature);
		}

		if (MOCK_ENDPOINTS.some((path) => newPathname.startsWith(path)) && process.env.MOCK_API) {
			logger.info('mocking request', { pathname, newPathname });
			return NextResponse.rewrite(new URL(newPathname, req.url));
		}
		logger.info('proxying request', { apiUrl: process.env.API_URL, newPathname, pathname });
		return NextResponse.rewrite(new URL(newPathname, process.env.API_URL), {
			request: {
				headers,
			},
		});
	}

	if (pathname.startsWith('/auth') && id) {
		if (validGroups.has(group)) {
			logger.info('redirecting to /app/dashboard');
			return NextResponse.redirect(new URL('/app/dashboard', req.url));
		}
		if (group === GROUPS.unconfirmed || group === GROUPS.confirmed) {
			logger.info('redirecting to /app/confirm');
			return NextResponse.redirect(new URL('/app/confirm', req.url));
		}
	}

	if (pathname.startsWith('/app/confirm') && validGroups.has(group)) {
		logger.info('redirecting to /app/dashboard');
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
