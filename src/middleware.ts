import { auth } from '@/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { GROUPS } from '@/constants/constants';
import logger from './lib/logger';
import { createHmacSHA256 } from './lib/hmac';
import { AppRoute } from '@/constants/appRoute';

const changePathname = (pathname: string) => pathname.replace(/^\/service\//, '/api/v1/');
const MOCK_ENDPOINTS: string[] = []; // Removed briefs from mock
const userGroups = new Set<string | undefined>([GROUPS.client, GROUPS.vendor]);
const HMAC_SECRET = process.env.HMAC_SECRET;

const CLAIM_PATH_PREFIX = '/app/brief/claim/';
const PENDING_BRIEF_COOKIE_NAME = 'aivus_pending_brief';
const PENDING_BRIEF_COOKIE_MAX_AGE = 3600;

const SUPPORTED_LOCALES = ['en', 'ru'] as const;
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const isSupportedLocale = (value: string): value is SupportedLocale => {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
};

const detectLocaleFromHeader = (acceptLanguage: string | null): SupportedLocale => {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const entries = acceptLanguage
    .split(',')
    .map((x) => {
      const [tag, ...rest] = x.trim().split(';');
      const qPart = rest.find((r) => r.trim().startsWith('q='));
      const q = qPart ? Number(qPart.trim().slice(2)) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const entry of entries) {
    const primary = entry.tag.split('-')[0];
    if (isSupportedLocale(primary)) {
      return primary;
    }
  }

  return DEFAULT_LOCALE;
};

const resolveLocale = (req: NextRequest): SupportedLocale => {
  const existing = req.cookies.get('locale')?.value;
  if (existing && isSupportedLocale(existing)) {
    return existing;
  }
  return detectLocaleFromHeader(req.headers.get('accept-language'));
};

const ensureLocaleCookie = (req: NextRequest, response: NextResponse): NextResponse => {
  const existing = req.cookies.get('locale')?.value;
  if (existing && isSupportedLocale(existing)) {
    return response;
  }

  const detected = detectLocaleFromHeader(req.headers.get('accept-language'));
  response.cookies.set('locale', detected, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  return response;
};

const createPageResponse = (req: NextRequest): NextResponse => {
  const locale = resolveLocale(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-locale', locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
};

// Public paths within /auth, accessible to all (authenticated and not)
const PUBLIC_AUTH_PATHS = ['/auth/confirm-email', '/auth/reset-password', '/auth/forgot-password'];

const isPublicAuthPath = (pathname: string): boolean => {
  return PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path));
};

// CSP for development with unsafe-eval (needed for Next.js hot reload / React dev tools)
const isDevelopment = process.env.NODE_ENV === 'development';
const connectSrcDev = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Note: 'unsafe-inline' is required for style-src because Next.js and Ant Design inject inline styles.
// script-src uses 'unsafe-inline' because Next.js injects inline scripts for hydration; nonce-based CSP requires custom server setup.
const CSP = isDevelopment
  ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' data: ${connectSrcDev}; frame-ancestors 'self' https://www.vilkaservice.com https://app.aivus.co`
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' data: https://api.aivus.co; frame-ancestors 'self' https://www.vilkaservice.com https://app.aivus.co";

const EMBED_CSP = isDevelopment
  ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' data: ${connectSrcDev}; frame-ancestors *`
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' data: https://api.aivus.co; frame-ancestors *";

export default auth(async (req) => {
  if (
    req.nextUrl.pathname.startsWith('/external') ||
    req.nextUrl.pathname.startsWith('/public/') ||
    req.nextUrl.pathname.startsWith('/public-brief') ||
    req.nextUrl.pathname.startsWith('/shared-brief') ||
    req.nextUrl.pathname === '/brief' ||
    req.nextUrl.pathname.startsWith('/brief/')
  ) {
    const response = createPageResponse(req);
    const isBriefEmbed = req.nextUrl.pathname.startsWith('/brief/') && req.nextUrl.searchParams.get('embed') === '1';
    response.headers.set('Content-Security-Policy', isBriefEmbed ? EMBED_CSP : CSP);
    return ensureLocaleCookie(req, response);
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
        return ensureLocaleCookie(req, response);
      }
      // CONFIRMED -> role selection
      else if (group === GROUPS.confirmed) {
        logger.info('redirecting to /app/group (confirmed)');
        const response = NextResponse.redirect(new URL(AppRoute.GROUP, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return ensureLocaleCookie(req, response);
      }
      // UNCONFIRMED -> email confirmation
      else {
        logger.info('redirecting to /app/confirm (unconfirmed)');
        const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return ensureLocaleCookie(req, response);
      }
    }
    logger.info('redirecting to /auth (no user)');
    const response = NextResponse.redirect(new URL(AppRoute.AUTH, req.url));
    response.headers.set('Content-Security-Policy', CSP);
    return ensureLocaleCookie(req, response);
  }

  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith('/service/')) {
    let newPathname = changePathname(pathname);
    if (search) {
      newPathname += search;
    }
    const headers = new Headers(req.headers);

    const incomingXff = req.headers.get('x-forwarded-for');
    if (incomingXff) {
      headers.set('x-forwarded-for', incomingXff);
    }

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
      const mockResponse = NextResponse.rewrite(new URL(newPathname, req.url));
      mockResponse.headers.set('Content-Security-Policy', CSP);
      return mockResponse;
    }
    logger.info('proxying request', { apiUrl: process.env.API_URL, newPathname, pathname });
    const proxyResponse = NextResponse.rewrite(new URL(newPathname, process.env.API_URL), {
      request: {
        headers,
      },
    });
    proxyResponse.headers.set('Content-Security-Policy', CSP);
    return proxyResponse;
  }

  // If path is /auth but NOT public (confirm-email, reset-password, etc.)
  if (pathname.startsWith('/auth') && !isPublicAuthPath(pathname) && id && group) {
    // CLIENT or VENDOR -> dashboard
    if (userGroups.has(group)) {
      logger.info('redirecting to /app/dashboard (from /auth, client/vendor)');
      const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return ensureLocaleCookie(req, response);
    }
    // CONFIRMED -> role selection
    else if (group === GROUPS.confirmed) {
      logger.info('redirecting to /app/group (from /auth, confirmed)');
      const response = NextResponse.redirect(new URL(AppRoute.GROUP, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return ensureLocaleCookie(req, response);
    }
    // UNCONFIRMED -> email confirmation
    else {
      logger.info('redirecting to /app/confirm (from /auth, unconfirmed)');
      const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return ensureLocaleCookie(req, response);
    }
  }

  if (pathname.startsWith('/app') && (!id || !group)) {
    if (pathname.startsWith(CLAIM_PATH_PREFIX)) {
      const briefId = pathname.slice(CLAIM_PATH_PREFIX.length).split('/')[0];
      const token = req.nextUrl.searchParams.get('token');
      const email = req.nextUrl.searchParams.get('email');
      const authUrl = new URL(AppRoute.AUTH, req.url);
      if (email) {
        authUrl.searchParams.set('email', email);
      }
      const response = NextResponse.redirect(authUrl);
      if (briefId && token) {
        const cookieValue = encodeURIComponent(`${briefId}:${token}`);
        response.cookies.set(PENDING_BRIEF_COOKIE_NAME, cookieValue, {
          path: '/',
          maxAge: PENDING_BRIEF_COOKIE_MAX_AGE,
          sameSite: 'lax',
        });
      }
      response.headers.set('Content-Security-Policy', CSP);
      return ensureLocaleCookie(req, response);
    }
    const response = NextResponse.redirect(new URL(AppRoute.AUTH, req.url));
    response.headers.set('Content-Security-Policy', CSP);
    return ensureLocaleCookie(req, response);
  }

  // Protect /app pages based on user group
  if (pathname.startsWith('/app') && id && group) {
    // If user is UNCONFIRMED, they can only be on /app/confirm
    if (group === GROUPS.unconfirmed && !pathname.startsWith(AppRoute.CONFIRM)) {
      if (pathname.startsWith(CLAIM_PATH_PREFIX)) {
        const briefId = pathname.slice(CLAIM_PATH_PREFIX.length).split('/')[0];
        const token = req.nextUrl.searchParams.get('token');
        const confirmUrl = new URL(AppRoute.CONFIRM, req.url);
        const response = NextResponse.redirect(confirmUrl);
        if (briefId && token) {
          const cookieValue = encodeURIComponent(`${briefId}:${token}`);
          response.cookies.set(PENDING_BRIEF_COOKIE_NAME, cookieValue, {
            path: '/',
            maxAge: PENDING_BRIEF_COOKIE_MAX_AGE,
            sameSite: 'lax',
          });
        }
        response.headers.set('Content-Security-Policy', CSP);
        return ensureLocaleCookie(req, response);
      }
      const response = NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return ensureLocaleCookie(req, response);
    }

    // If user is CONFIRMED, they can only be on /app/group
    if (group === GROUPS.confirmed && !pathname.startsWith(AppRoute.GROUP)) {
      const response = NextResponse.redirect(new URL(AppRoute.GROUP, req.url));
      response.headers.set('Content-Security-Policy', CSP);
      return ensureLocaleCookie(req, response);
    }

    // If user is CLIENT/VENDOR, they CANNOT be on /app/confirm or /app/group
    if (userGroups.has(group)) {
      if (pathname.startsWith(AppRoute.CONFIRM) || pathname.startsWith(AppRoute.GROUP)) {
        const response = NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
        response.headers.set('Content-Security-Policy', CSP);
        return ensureLocaleCookie(req, response);
      }
    }
  }

  // Add Cache-Control headers for auth routes to prevent caching sensitive pages
  if (pathname.startsWith('/auth')) {
    const response = createPageResponse(req);
    response.headers.set('Content-Security-Policy', CSP);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return ensureLocaleCookie(req, response);
  }

  // Add CSP to all other requests
  const response = createPageResponse(req);
  response.headers.set('Content-Security-Policy', CSP);
  return ensureLocaleCookie(req, response);
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
