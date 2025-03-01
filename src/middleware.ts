import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { GROUPS } from './lib/constants';
import logger from './lib/logger';

const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');
async function createHmacSHA256(key: string, message: string) {
	const enc = new TextEncoder();
	const keyData = enc.encode(key);
	const msgData = enc.encode(message);

	const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
	// Преобразуем в hex-строку
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

const MOCK_ENDPOINTS = ['/api/v1/briefs'];
const validGroups = new Set<string | undefined>([GROUPS.client, GROUPS.vendor]);
const X_API_KEY = process.env.API_KEY;
const HMAC_SECRET = process.env.HMAC_SECRET;

export default auth(async (req) => {
	if (!X_API_KEY) {
		logger.error('API_KEY not set');
		return NextResponse.error();
	}
	if (!HMAC_SECRET) {
		logger.error('HMAC_SECRET not set');
		return NextResponse.error();
	}

	if (req.nextUrl.pathname === '/') {
		logger.info('redirecting to /auth');
		return NextResponse.redirect(new URL('/auth', req.url));
	}
	const { id, group } = req.auth?.user ?? {};
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/service/')) {
		// TODO: Add a check for the X-API-KEY header and remove access token check
		// if (!accessToken && !pathname.startsWith('/service/auth/')) {
		// 	logger.info('redirecting to /auth');
		// 	return NextResponse.redirect(new URL('/auth', req.url));
		// }

		const newPathname = changePathname(pathname);
		const requestHeaders = new Headers(req.headers);
		const timestamp = Math.floor(Date.now() / 1000).toString();
		requestHeaders.set('x-api-key', X_API_KEY);
		requestHeaders.set('x-timestamp', timestamp);

		const method = req.method;
		const stringToSign = `${method}:${newPathname}:${timestamp}:${id}:${group}`;
		const computedSignature = await createHmacSHA256(HMAC_SECRET, stringToSign);
		requestHeaders.set('x-signature', computedSignature);

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
		if (validGroups.has(group)) {
			logger.info('redirecting to /app/dashboard');
			return NextResponse.redirect(new URL('/app/dashboard', req.url));
		}
		if (group === GROUPS.unconfirmed) {
			logger.info('redirecting to /app/unconfirmed');
			return NextResponse.redirect(new URL('/app/unconfirmed', req.url));
		}
	}

	if (pathname.startsWith('/app/unconfirmed') && validGroups.has(group)) {
		logger.info('redirecting to /app/dashboard');
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
