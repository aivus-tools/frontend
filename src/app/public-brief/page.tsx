'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GROUPS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { BriefEditorLayout } from '@/modules/client/BriefEditor/BriefEditorLayout';
import { setPendingBrief } from '@/helpers/pendingBrief';

export default function PublicBriefPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }
    if (session?.user?.group === GROUPS.client) {
      router.replace(AppRoute.CREATE_BRIEF);
    }
  }, [sessionStatus, session?.user?.group, router]);

  const handleBriefCreated = (briefId: string, token?: string) => {
    if (token && typeof window !== 'undefined') {
      // Preserve component state by replacing URL without remount.
      window.history.replaceState(null, '', AppRoute.PUBLIC_BRIEF_DETAIL(briefId));
    }
  };

  const handleRegisterClick = (briefId: string | null, token: string | null, email: string | null) => {
    if (briefId && token) {
      setPendingBrief(briefId, token);
    }
    router.push(email ? `/auth?email=${encodeURIComponent(email)}` : '/auth');
  };

  return (
    <BriefEditorLayout mode='anonymous' onBriefCreated={handleBriefCreated} onRegisterClick={handleRegisterClick} />
  );
}
