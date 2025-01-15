import { auth } from '@/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { ROLES } from './services/constants';
import { getSessionInfo } from './app/lib/session';

const validRoles = new Set<string | undefined>([ROLES.client, ROLES.vendor]);

export const middleware = async (req: NextRequest, res: NextResponse) => {
	if (req.nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/auth', req.url));
	}

	const { role, id } = await getSessionInfo();
	const { pathname } = req.nextUrl;

	if ((pathname.startsWith('/auth') || pathname === '/') && id) {
		return NextResponse.redirect(new URL('/app', req.url));
	}

	if (pathname.startsWith('/app') && (!role || !id)) {
		return NextResponse.redirect(new URL('/auth', req.url));
	}

	if (pathname.startsWith('/app') && role === ROLES.unconfirmed) {
		return NextResponse.redirect(new URL('/app', req.url));
	}

	if (pathname.endsWith('app') && validRoles.has(role)) {
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}

	return auth(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
};
