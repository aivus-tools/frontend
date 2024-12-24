import { auth } from '@/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { ROLES } from './services/constants';
import { cookies } from 'next/headers';

const validRoles = new Set<string | undefined>([ROLES.client, ROLES.vendor]);

export const middleware = async (req: NextRequest, res: NextResponse) => {
	if (req.nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/auth', req.url));
	}

	const cookieStore = await cookies();
	const role = cookieStore.get('role')?.value;

	if (req.nextUrl.pathname.endsWith('app') && validRoles.has(role)) {
		return NextResponse.redirect(new URL('/app/dashboard', req.url));
	}

	return auth(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
};
