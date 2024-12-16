export { auth as middleware } from '@/auth';
// import { NextRequest, NextResponse } from 'next/server';
// import { auth as authMiddleware } from '@/auth';
// import { cookies } from 'next/headers';
// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function middleware(req: NextRequest, res: NextResponse) {
// 	// 2. Check if the current route is protected or public
// 	const isProtectedRoute = req.nextUrl.pathname.startsWith('/app');
// 	const auth = await authMiddleware(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

// 	console.log('auth?.user', auth?.user);
// 	// 3. Decrypt the session from the cookie
// 	const userType = (await cookies()).get('session')?.value ?? auth?.user;

// 	// 4. Redirect to /login if the user is not authenticated
// 	if (isProtectedRoute && !userType) {
// 		return NextResponse.redirect(new URL('/auth', req.nextUrl));
// 	}

// 	// 5. Redirect to /dashboard if the user is authenticated
// 	if (!isProtectedRoute && userType && !req.nextUrl.pathname.startsWith('/dashboard')) {
// 		return NextResponse.redirect(new URL('/app/dashboard', req.nextUrl));
// 	}

// 	return;
// }

// // Routes Middleware should not run on
// export const config = {
// 	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// };
