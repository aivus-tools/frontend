'use client';

import React, { useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { App } from 'antd';
import { AnonymousBriefEditor } from '@/modules/client/BriefEditor/AnonymousBriefEditor';
import { getPublicBriefToken, savePublicBriefToken } from '@/services/client/publicBriefApi';
import { setPendingBrief } from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import { PageSpinner } from '@/components/PageSpinner/PageSpinner';

export default function PublicBriefDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const briefId = params.briefId as string;
  const taskId = searchParams.get('taskId');
  const tokenFromQuery = searchParams.get('token');
  const redirectRef = useRef(false);

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

  const storedToken = typeof window !== 'undefined' ? getPublicBriefToken(briefId) : null;
  const token = tokenFromQuery ?? storedToken;

  const group = session?.user?.group;

  useEffect(() => {
    if (redirectRef.current || sessionStatus === 'loading' || !briefId) {
      return;
    }
    if (group === GROUPS.vendor) {
      redirectRef.current = true;
      message.warning(t('BRIEF_LINK_CLIENTS_ONLY'));
      router.replace(AppRoute.DASHBOARD);
      return;
    }
    if (group === GROUPS.client) {
      redirectRef.current = true;
      router.replace(token ? AppRoute.BRIEF_CLAIM(briefId) : AppRoute.BRIEF_DETAIL(briefId));
    }
  }, [sessionStatus, group, briefId, token, router, message]);

  const handleRegisterClick = (currentBriefId: string | null, currentToken: string | null, email: string | null) => {
    const resolvedBriefId = currentBriefId ?? briefId;
    const resolvedToken = currentToken ?? token;
    if (resolvedBriefId && resolvedToken) {
      setPendingBrief(resolvedBriefId, resolvedToken);
    }
    router.push(email ? `/auth?email=${encodeURIComponent(email)}` : '/auth');
  };

  if (group === GROUPS.client || group === GROUPS.vendor) {
    return <PageSpinner />;
  }

  return (
    <AnonymousBriefEditor
      briefId={briefId}
      token={token}
      initialTaskId={taskId}
      onRegisterClick={handleRegisterClick}
    />
  );
}
