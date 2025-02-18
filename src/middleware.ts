import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { GROUPS } from './lib/constants';
import logger from './lib/logger';

const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');

const MOCK_ENDPOINTS = ['/api/v1/briefs'];
const validRoles = new Set<string | undefined>([GROUPS.client, GROUPS.vendor]);

export default auth((req) => {
	if (req.nextUrl.pathname === '/') {
		logger.info('redirecting to /auth');
		return NextResponse.redirect(new URL('/auth', req.url));
	}
	const { id, role, accessToken } = req.auth?.user ?? {};
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/service/')) {
		if (!accessToken && !pathname.startsWith('/service/auth/')) {
			logger.info('redirecting to /auth');
			return NextResponse.redirect(new URL('/auth', req.url));
		}

		const requestHeaders = new Headers(req.headers);
		requestHeaders.set('Authorization', `Bearer ${accessToken}`);
		const newPathname = changePathname(pathname);

		if (MOCK_ENDPOINTS.some((path) => newPathname.startsWith(path)) && process.env.MOCK_API) {
			logger.info('mocking request', { pathname, newPathname });
			return NextResponse.rewrite(new URL(newPathname, req.url));
		}
		logger.info('proxying request', { apiUrl: process.env.API_URL, newPathname, pathname });
		return NextResponse.rewrite(new URL(newPathname, process.env.API_URL), {
			request: {
				headers: requestHeaders,
			},
		});
	}

	if (pathname.startsWith('/auth') && id) {
		if (validRoles.has(role)) {
			logger.info('redirecting to /app/dashboard');
			return NextResponse.redirect(new URL('/app/dashboard', req.url));
		}
		if (role === GROUPS.unconfirmed) {
			logger.info('redirecting to /app/unconfirmed');
			return NextResponse.redirect(new URL('/app/unconfirmed', req.url));
		}
	}

	if (pathname.startsWith('/app/unconfirmed') && validRoles.has(role)) {
		logger.info('redirecting to /app/dashboard');
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
