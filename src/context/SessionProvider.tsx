'use client';

import { logout } from '@/auth/actions/logout';
import type { Session } from 'next-auth';
import { SessionProvider as NextSessionProvider, useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SessionGuard = ({ children }: PropsWithChildren) => {
  const session = useSession();
  const pathname = usePathname();
  useEffect(() => {
    if (session.status === 'unauthenticated' && !pathname.startsWith('/external')) {
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
