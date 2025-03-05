'use client';
import { GROUPS } from '@/lib/constants';
import { useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

export const GroupSwitch = ({ children }: PropsWithChildren) => {
	const session = useSession();
	const segment = useSelectedLayoutSegment();
	const { group } = session.data?.user ?? {};

	useEffect(() => {
		if (group === GROUPS.unconfirmed && segment !== 'confirm') {
			window.location.href = `app/confirm`;
		}
		if (group === GROUPS.confirmed && segment !== 'group') {
			window.location.href = `/app/group`;
		}
		if (group === GROUPS.vendor || group === GROUPS.client) {
			window.location.href = `/app/dashboard`;
		}
	}, [group, segment]);

	return children;
};
