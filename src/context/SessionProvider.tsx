'use client';

import { logout } from '@/auth/actions/logout';
import type { Session } from 'next-auth';
import { SessionProvider as NextSessionProvider, useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Public paths where logout should not be called on unauthenticated status.
// Must stay in sync with the public allowlist in middleware.ts.
const PUBLIC_PATHS = [
  '/auth/confirm-email',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/external',
  '/public',
  '/public-brief',
  '/shared-brief',
  '/brief',
];

const SessionGuard = ({ children }: PropsWithChildren) => {
  const session = useSession();
  const pathname = usePathname();
  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    if (session.status === 'unauthenticated' && !isPublicPath) {
      logout();
    }
  }, [pathname, session.status]);

  return session ? children : null;
};

export default function SessionProvider({ children, session }: PropsWithChildren<{ session: Session | null }>) {
  return (
    <NextSessionProvider session={session}>
      <SessionGuard>{children}</SessionGuard>
    </NextSessionProvider>
  );
}
