'use client';

import React, { useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BriefEditorLayout } from '@/modules/client/BriefEditor/BriefEditorLayout';
import { getPublicBriefToken, savePublicBriefToken } from '@/services/client/publicBriefApi';
import { setPendingBrief } from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { PageSpinner } from '@/components/PageSpinner/PageSpinner';

export default function PublicBriefDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const briefId = params.briefId as string;
  const taskId = searchParams.get('taskId');
  const tokenFromQuery = searchParams.get('token');
  const claimRedirectedRef = useRef(false);

  useEffect(() => {
    if (!tokenFromQuery) {
      return;
    }
    savePublicBriefToken(briefId, tokenFromQuery);
    const current = new URLSearchParams(window.location.search);
    current.delete('token');
    const newSearch = current.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
    window.history.replaceState(null, '', newUrl);
  }, [briefId, tokenFromQuery]);

  useEffect(() => {
    if (claimRedirectedRef.current) {
      return;
    }
    if (sessionStatus === 'loading') {
      return;
    }
    if (session?.user?.group === GROUPS.client) {
      claimRedirectedRef.current = true;
      router.replace(AppRoute.BRIEF_CLAIM(briefId));
    }
  }, [sessionStatus, session?.user?.group, briefId, router]);

  if (session?.user?.group === GROUPS.client && !claimRedirectedRef.current) {
    return <PageSpinner />;
  }

  const storedToken = typeof window !== 'undefined' ? getPublicBriefToken(briefId) : null;
  const token = tokenFromQuery ?? storedToken;

  const handleRegisterClick = (currentBriefId: string | null, currentToken: string | null, email: string | null) => {
    const resolvedBriefId = currentBriefId ?? briefId;
    const resolvedToken = currentToken ?? token;
    if (resolvedBriefId && resolvedToken) {
      setPendingBrief(resolvedBriefId, resolvedToken);
    }
    router.push(email ? `/auth?email=${encodeURIComponent(email)}` : '/auth');
  };

  return (
    <BriefEditorLayout
      mode='anonymous'
      briefId={briefId}
      token={token}
      initialTaskId={taskId}
      onRegisterClick={handleRegisterClick}
    />
  );
}
