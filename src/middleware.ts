import { auth } from '@/auth/auth';
import { NextResponse } from 'next/server';
import { GROUPS } from '@/constants/constants';
import logger from './lib/logger';
import { createHmacSHA256 } from './lib/hmac';
import { AppRoute } from '@/constants/appRoute';

const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');
const MOCK_ENDPOINTS: string[] = []; // Removed briefs from mock
const userGroups = new Set<string | undefined>([GROUPS.client, GROUPS.vendor]);
const HMAC_SECRET = process.env.HMAC_SECRET;

// Public paths within /auth, accessible to all (authenticated and not)
const PUBLIC_AUTH_PATHS = ['/auth/confirm-email', '/auth/reset-password', '/auth/forgot-password'];

const isPublicAuthPath = (pathname: string): boolean => {
  return PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path));
};

// CSP for development with unsafe-eval (needed for Next.js hot reload / React dev tools)
const isDevelopment = process.env.NODE_ENV === 'development';
const connectSrcDev = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Note: 'unsafe-inline' is required for style-src because Next.js, Ant Design, and styled-components inject inline styles.
// script-src uses 'unsafe-inline' because Next.js injects inline scripts for hydration; nonce-based CSP requires custom server setup.
const CSP = isDevelopment
  ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' data: ${connectSrcDev}; frame-ancestors 'self' https://www.vilkaservice.com https://app.aivus.co`
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' data: https://api.aivus.co; frame-ancestors 'self' https://www.vilkaservice.com https://app.aivus.co";

export default auth(async (req) => {
  if (req.nextUrl.pathname.startsWith('/external') || req.nextUrl.pathname.startsWith('/public')) {
    // For /public routes, still proxy /service/ calls but skip auth requirements
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', CSP);
    return response;
  }

  if (!HMAC_SECRET) {
    logger.error('HMAC_SECRET not set');
    return new NextResponse('HMAC_SECRET not set', { status: 500 });
  }

  const { id, group, vendorId } = req.auth?.user ?? {};
  logger.debug(
    'middleware: user_id=%s, user_group=%s, vendor_id=%s, pathname=%s',
    id,
    group,
    vendorId,
    req.nextUrl.pathname
  );

  if (req.nextUrl.pathname === AppRoute.HOME) {
    if (id && group) {
      // CLIENT or VENDOR -> dashboard
      if (userGroups.has(group)) {
        logger.info('redirecting to /app/dashboard (client/vendor)');
        const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return response;
      }
      // CONFIRMED -> role selection
      else if (group === GROUPS.confirmed) {
        logger.info('redirecting to /app/group (confirmed)');
        const response = NextResponse.redirect(new URL(AppRoute.GROUP, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return response;
      }
      // UNCONFIRMED -> email confirmation
      else {
        logger.info('redirecting to /app/confirm (unconfirmed)');
        const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return response;
      }
    }
    logger.info('redirecting to /auth (no user)');
    const response = NextResponse.redirect(new URL(AppRoute.AUTH, req.url));
    response.headers.set('Content-Security-Policy', CSP);
    return response;
  }

  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith('/service/')) {
    let newPathname = changePathname(pathname);
    if (search) {
      newPathname += search;
    }
    const headers = new Headers(req.headers);
    if (!newPathname.startsWith('/api/v1/auth/') && !newPathname.startsWith('/api/v1/public/')) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      headers.set('x-timestamp', timestamp);
      headers.set('x-user-id', id ?? '');
      headers.set('x-user-group', group ?? '');
      if (vendorId) {
        headers.set('x-vendor-id', vendorId);
      }

      const method = req.method;
      const stringToSign = `${method}:${newPathname}:${timestamp}:${id}:${group}`;
      const computedSignature = await createHmacSHA256(stringToSign);
      headers.set('x-signature', computedSignature);
    }

    if (MOCK_ENDPOINTS.some((path) => newPathname.startsWith(path)) && process.env.MOCK_API) {
      logger.info('mocking request', { pathname, newPathname });
      const response = NextResponse.rewrite(new URL(newPathname, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }
    logger.info('proxying request', { apiUrl: process.env.API_URL, newPathname, pathname });
    const response = NextResponse.rewrite(new URL(newPathname, process.env.API_URL), {
      request: {
        headers,
      },
    });
    response.headers.set('Content-Security-Policy', CSP);
    return response;
  }

  // If path is /auth but NOT public (confirm-email, reset-password, etc.)
  if (pathname.startsWith('/auth') && !isPublicAuthPath(pathname) && id && group) {
    // CLIENT or VENDOR -> dashboard
    if (userGroups.has(group)) {
      logger.info('redirecting to /app/dashboard (from /auth, client/vendor)');
      const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }
    // CONFIRMED -> role selection
    else if (group === GROUPS.confirmed) {
      logger.info('redirecting to /app/group (from /auth, confirmed)');
      const response = NextResponse.redirect(new URL(AppRoute.GROUP, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }
    // UNCONFIRMED -> email confirmation
    else {
      logger.info('redirecting to /app/confirm (from /auth, unconfirmed)');
      const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }
  }

  if (pathname.startsWith('/app') && (!id || !group)) {
    const response = NextResponse.redirect(new URL(AppRoute.AUTH, req.url));
    response.headers.set('Content-Security-Policy', CSP);
    return response;
  }

  // Protect /app pages based on user group
  if (pathname.startsWith('/app') && id && group) {
    // If user is UNCONFIRMED, they can only be on /app/confirm
    if (group === GROUPS.unconfirmed && !pathname.startsWith(AppRoute.CONFIRM)) {
      const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }

    // If user is CONFIRMED, they can only be on /app/group
    if (group === GROUPS.confirmed && !pathname.startsWith(AppRoute.GROUP)) {
      const response = NextResponse.redirect(new URL(AppRoute.GROUP, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }

    // If user is CLIENT/VENDOR, they CANNOT be on /app/confirm or /app/group
    if (userGroups.has(group)) {
      if (pathname.startsWith(AppRoute.CONFIRM) || pathname.startsWith(AppRoute.GROUP)) {
        const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return response;
      }
    }
  }

  // Add Cache-Control headers for auth routes to prevent caching sensitive pages
  if (pathname.startsWith('/auth')) {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', CSP);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // Add CSP to all other requests
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', CSP);
  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
