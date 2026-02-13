'use client';

import { logout } from '@/auth/actions/logout';
import type { Session } from 'next-auth';
import { SessionProvider as NextSessionProvider, useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Публичные пути, где не нужно вызывать logout при unauthenticated
const PUBLIC_PATHS = ['/auth/confirm-email', '/auth/reset-password', '/auth/forgot-password', '/external', '/public'];

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
