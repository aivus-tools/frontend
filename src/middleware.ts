import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { ROLES } from './lib/constants';

const validRoles = new Set<string | undefined>([ROLES.client, ROLES.vendor]);
const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');

export default auth((req) => {
	if (req.nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/auth', req.url));
	}
	const { id, role } = req.auth?.user ?? {};
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/service/')) {
		const newPathname = changePathname(pathname);
		return NextResponse.rewrite(new URL(newPathname, process.env.API_URL));
	}

	if (pathname.startsWith('/auth') && id) {
		return NextResponse.redirect(new URL('/app', req.url));
	}

	if (pathname.startsWith('/app') && (!role || !id)) {
		return NextResponse.redirect(new URL('/auth', req.url));
	}

	if (!pathname.startsWith('/app/unconfirmed') && role === ROLES.unconfirmed) {
		return NextResponse.redirect(new URL('/app/unconfirmed', req.url));
	}

	if (pathname.endsWith('app') && validRoles.has(role)) {
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
