'use client';
import { GROUPS } from '@/constants/constants';
import { useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { AppRoute } from '@/constants/appRoute';

export const GroupSwitch = ({ children }: PropsWithChildren) => {
  const session = useSession();
  const segment = useSelectedLayoutSegment();
  const { group } = session.data?.user ?? {};

  useEffect(() => {
    if (group === GROUPS.unconfirmed && segment !== 'confirm') {
      window.location.href = AppRoute.CONFIRM;
    }
    if (group === GROUPS.confirmed && segment !== 'group') {
      window.location.href = AppRoute.GROUP;
    }
    if (group === GROUPS.vendor || group === GROUPS.client) {
      window.location.href = AppRoute.DASHBOARD;
    }
  }, [group, segment]);

  return children;
};
