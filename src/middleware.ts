import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { ROLES } from './lib/constants';
import logger from './lib/logger';

const validRoles = new Set<string | undefined>([ROLES.client, ROLES.vendor]);
const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');

const MOCK_ENDPOINTS = ['/api/v1/briefs'];

export default auth((req) => {
	logger.info('middleware', {
		nextUrl: req.nextUrl.pathname,
		auth: req.auth,
		request: req,
	});
	if (req.nextUrl.pathname === '/') {
		logger.info('redirecting to /auth');
		return NextResponse.redirect(new URL('/auth', req.url));
	}
	const { id, role } = req.auth?.user ?? {};
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/service/')) {
		const newPathname = changePathname(pathname);

		if (MOCK_ENDPOINTS.some((path) => newPathname.startsWith(path)) && process.env.MOCK_API) {
			logger.info('mocking request', { pathname, newPathname });
			return NextResponse.rewrite(new URL(newPathname, req.url));
		}
		logger.info('proxying request', { pathname, newPathname });
		return NextResponse.rewrite(new URL(newPathname, process.env.API_URL));
	}

	if (pathname.startsWith('/auth') && id) {
		logger.info('redirecting to /app');
		return NextResponse.redirect(new URL('/app', req.url));
	}

	if (pathname.startsWith('/app') && (!role || !id)) {
		logger.info('redirecting to /auth');
		return NextResponse.redirect(new URL('/auth', req.url));
	}

	if (!pathname.startsWith('/app') && pathname !== '/app/unconfirmed' && role === ROLES.unconfirmed) {
		logger.info('redirecting to /app/unconfirmed');
		return NextResponse.redirect(new URL('/app/unconfirmed', req.url));
	}

	if (pathname.endsWith('app') && validRoles.has(role)) {
		logger.info('redirecting to /app/dashboard');
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
