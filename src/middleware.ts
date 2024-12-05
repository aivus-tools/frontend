export { auth as middleware } from '@/auth';
// import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';

// // 1. Specify protected and public routes
// const protectedRoutes = ['/app/*'];
// const publicRoutes = ['/auth', '/'];

// export default async function middleware(req: NextRequest) {
// 	// 2. Check if the current route is protected or public
// 	const path = req.nextUrl.pathname;
// 	const isProtectedRoute = protectedRoutes.includes(path);
// 	const isPublicRoute = publicRoutes.includes(path);
// 	console.log(isProtectedRoute, isPublicRoute);
// 	// 3. Decrypt the session from the cookie
// 	const userType = (await cookies()).get('session')?.value;

// 	// 4. Redirect to /login if the user is not authenticated
// 	if (isProtectedRoute && !userType) {
// 		return NextResponse.redirect(new URL('/auth', req.nextUrl));
// 	}

// 	// 5. Redirect to /dashboard if the user is authenticated
// 	if (isPublicRoute && userType && !req.nextUrl.pathname.startsWith('/dashboard')) {
// 		return NextResponse.redirect(new URL('/app/dashboard', req.nextUrl));
// 	}

// 	return NextResponse.next();
// }

// // Routes Middleware should not run on
// export const config = {
// 	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// };
