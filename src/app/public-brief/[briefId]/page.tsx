'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Modal } from 'antd';
import { BriefEditorLayout } from '@/modules/client/BriefEditor/BriefEditorLayout';
import {
  getPublicBriefToken,
  savePublicBriefToken,
  useLazyGetPublicBriefDetailQuery,
} from '@/services/client/publicBriefApi';
import { setPendingBrief } from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { PageSpinner } from '@/components/PageSpinner/PageSpinner';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';

type ClaimDecision = 'idle' | 'checking' | 'asking' | 'redirecting';

const buildContactLabel = (name: string | null, email: string | null): string | null => {
  const trimmedName = (name ?? '').trim();
  const trimmedEmail = (email ?? '').trim();
  if (trimmedName && trimmedEmail) {
    return `${trimmedName} (${trimmedEmail})`;
  }
  return trimmedName || trimmedEmail || null;
};

export default function PublicBriefDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const briefId = params.briefId as string;
  const taskId = searchParams.get('taskId');
  const tokenFromQuery = searchParams.get('token');

  const [triggerFetchPublicDetail] = useLazyGetPublicBriefDetailQuery();
  const [claimDecision, setClaimDecision] = useState<ClaimDecision>('idle');
  const [contactLabel, setContactLabel] = useState<string | null>(null);
  const detailCheckRef = useRef(false);

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

  useEffect(() => {
    if (detailCheckRef.current) {
      return;
    }
    if (sessionStatus === 'loading') {
      return;
    }
    if (session?.user?.group !== GROUPS.client) {
      return;
    }
    if (!briefId) {
      return;
    }
    detailCheckRef.current = true;
    if (!token) {
      setClaimDecision('redirecting');
      router.replace(AppRoute.BRIEF_DETAIL(briefId));
      return;
    }
    setClaimDecision('checking');
    triggerFetchPublicDetail({ briefId, token })
      .unwrap()
      .then((detail) => {
        setContactLabel(buildContactLabel(detail.contactName ?? null, detail.contactEmail ?? null));
        setClaimDecision('asking');
      })
      .catch((error) => {
        logger.warn('Public brief detail unavailable, routing to authenticated view', error);
        setClaimDecision('redirecting');
        router.replace(AppRoute.BRIEF_DETAIL(briefId));
      });
  }, [sessionStatus, session?.user?.group, briefId, token, triggerFetchPublicDetail, router]);

  const handleConfirmClaim = () => {
    setClaimDecision('redirecting');
    router.replace(AppRoute.BRIEF_CLAIM(briefId));
  };

  const handleDeclineClaim = () => {
    setClaimDecision('redirecting');
    router.replace(AppRoute.DASHBOARD);
  };

  const handleRegisterClick = (currentBriefId: string | null, currentToken: string | null, email: string | null) => {
    const resolvedBriefId = currentBriefId ?? briefId;
    const resolvedToken = currentToken ?? token;
    if (resolvedBriefId && resolvedToken) {
      setPendingBrief(resolvedBriefId, resolvedToken);
    }
    router.push(email ? `/auth?email=${encodeURIComponent(email)}` : '/auth');
  };

  const isClientSession = session?.user?.group === GROUPS.client;
  if (isClientSession) {
    return (
      <>
        <PageSpinner />
        <Modal
          open={claimDecision === 'asking'}
          title={t('BRIEF_V3_CLAIM_MODAL_TITLE')}
          okText={t('BRIEF_V3_CLAIM_MODAL_CONFIRM')}
          cancelText={t('BRIEF_V3_CLAIM_MODAL_DECLINE')}
          onOk={handleConfirmClaim}
          onCancel={handleDeclineClaim}
          closable={false}
          maskClosable={false}
        >
          {contactLabel
            ? t('BRIEF_V3_CLAIM_MODAL_BODY_WITH_CONTACT', contactLabel)
            : t('BRIEF_V3_CLAIM_MODAL_BODY_PLAIN')}
        </Modal>
      </>
    );
  }

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
