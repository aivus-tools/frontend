'use client';

import { logout } from '@/app/actions/logout';
import type { Session } from 'next-auth';
import { SessionProvider as NextSessionProvider, useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';

const SessionGuard = ({ children }: PropsWithChildren) => {
	const session = useSession();
	useEffect(() => {
		if (session.status === 'unauthenticated') {
			logout();
		}
	}, [session.status]);

	return session ? children : null;
};

export default function SessionProvider({ children, session }: PropsWithChildren<{ session: Session | null }>) {
	return (
		<NextSessionProvider session={session}>
			<SessionGuard>{children}</SessionGuard>
		</NextSessionProvider>
	);
}
