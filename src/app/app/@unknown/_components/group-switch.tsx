'use client';
import { GROUPS } from '@/constants/constants';
import { useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { AppRoute } from '@/constants/appRoute';
import { PageTitleSync } from '@/components/PageTitleSync';

export const GroupSwitch = ({ children }: PropsWithChildren) => {
  const session = useSession();
  const segment = useSelectedLayoutSegment();
  const { group } = session.data?.user ?? {};

  useEffect(() => {
    // Roleless users (CONFIRMED, or legacy UNCONFIRMED) pick a role; email
    // confirmation is no longer a gate and nags via a dashboard banner instead.
    if ((group === GROUPS.confirmed || group === GROUPS.unconfirmed) && segment !== 'group') {
      window.location.href = AppRoute.GROUP;
    }
    if (group === GROUPS.vendor || group === GROUPS.client) {
      window.location.href = AppRoute.DASHBOARD;
    }
  }, [group, segment]);

  return (
    <>
      <PageTitleSync />
      {children}
    </>
  );
};
