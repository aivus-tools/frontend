import { auth } from '@/auth/auth';
import { NextResponse } from 'next/server';
import { GROUPS } from '@/constants/constants';
import logger from './lib/logger';
import { createHmacSHA256 } from './lib/hmac';
import { AppRoute } from '@/constants/appRoute';

const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');
const MOCK_ENDPOINTS = ['/api/v1/briefs'];
const userGroups = new Set<string | undefined>([GROUPS.client, GROUPS.vendor]);
const HMAC_SECRET = process.env.HMAC_SECRET;

// Публичные пути внутри /auth, доступные всем (авторизованным и нет)
const PUBLIC_AUTH_PATHS = ['/auth/confirm-email', '/auth/reset-password', '/auth/forgot-password'];

const isPublicAuthPath = (pathname: string): boolean => {
  return PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path));
};

// CSP для development с unsafe-eval
const isDevelopment = process.env.NODE_ENV === 'development';
const CSP = isDevelopment
  ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8000; frame-ancestors 'self' https://www.vilkaservice.com https://app.aivus.co"
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.aivus.co; frame-ancestors 'self' https://www.vilkaservice.com https://app.aivus.co";

export default auth(async (req) => {
  if (req.nextUrl.pathname.startsWith('/external')) {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', CSP);
    return response;
  }

  if (!HMAC_SECRET) {
    logger.error('HMAC_SECRET not set');
    return new NextResponse('HMAC_SECRET not set', { status: 500 });
  }

  const { id, group } = req.auth?.user ?? {};

  if (req.nextUrl.pathname === AppRoute.HOME) {
    if (id && group) {
      if (userGroups.has(group)) {
        logger.info('redirecting to /app/dashboard');
        const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return response;
      } else {
        logger.info('redirecting to /app/confirm');
        const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return response;
      }
    }
    logger.info('redirecting to /auth');
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

  // Если путь /auth, но НЕ публичный (confirm-email, reset-password и т.д.)
  if (pathname.startsWith('/auth') && !isPublicAuthPath(pathname) && id && group) {
    if (userGroups.has(group)) {
      logger.info('redirecting to /app/dashboard');
      const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    } else {
      logger.info('redirecting to /app/confirm');
      const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return response;
    }
  }

  if (pathname.startsWith('/app') && (!id || !group)) {
    logger.info('redirecting to /auth');
    const response = NextResponse.redirect(new URL(AppRoute.AUTH, req.url));
    response.headers.set('Content-Security-Policy', CSP);
    return response;
  }

  // Добавляем CSP ко всем остальным запросам
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', CSP);
  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
