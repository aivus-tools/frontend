'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BriefEditorLayout } from '@/modules/client/BriefEditorV2/BriefEditorLayout';
import { getPublicBriefToken } from '@/services/client/publicBriefApi';
import { setPendingBrief } from '@/helpers/pendingBrief';

export default function PublicBriefDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const briefId = params.briefId as string;
  const taskId = searchParams.get('taskId');

  const token = typeof window !== 'undefined' ? getPublicBriefToken(briefId) : null;

  const handleRegisterClick = (currentBriefId: string | null, currentToken: string | null) => {
    const resolvedBriefId = currentBriefId ?? briefId;
    const resolvedToken = currentToken ?? token;
    if (resolvedBriefId && resolvedToken) {
      setPendingBrief(resolvedBriefId, resolvedToken);
    }
    router.push('/auth');
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
