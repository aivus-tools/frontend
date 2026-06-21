'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { App, Button, Result } from 'antd';
import { useSession } from 'next-auth/react';
import { PageSpinner } from '@/components/PageSpinner';
import {
  useClaimPublicBriefMutation,
  getPublicBriefToken,
  removePublicBriefToken,
} from '@/services/client/publicBriefApi';
import { AppRoute } from '@/constants/appRoute';
import { GROUPS } from '@/constants/constants';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';

const CLAIM_TIMEOUT_MS = 10000;

type ClaimState = 'claiming' | 'no_access' | 'mismatch';

const BriefClaimPage = () => {
  const params = useParams<{ briefId: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const [claimBrief] = useClaimPublicBriefMutation();
  const [state, setState] = useState<ClaimState>('claiming');
  const claimed = useRef(false);

  const isClient = sessionStatus === 'authenticated' && session?.user?.group === GROUPS.client;

  useEffect(() => {
    if (claimed.current || !params.briefId || sessionStatus === 'loading') {
      return;
    }
    // A non-client (e.g. vendor) cannot own a client brief — show a clear
    // no-access screen instead of attempting the claim and 403-ing.
    if (sessionStatus === 'authenticated' && !isClient) {
      claimed.current = true;
      setState('no_access');
      return;
    }
    claimed.current = true;

    const urlToken = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('token');
    const token = urlToken || getPublicBriefToken(params.briefId);
    if (!token) {
      message.error(t('UNEXPECTED_ERROR'));
      router.replace(AppRoute.DASHBOARD);
      return;
    }

    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      message.error(t('UNEXPECTED_ERROR'));
      router.replace(AppRoute.DASHBOARD);
    }, CLAIM_TIMEOUT_MS);

    claimBrief({ briefId: params.briefId, token })
      .unwrap()
      .then(() => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        removePublicBriefToken(params.briefId);
        router.replace(AppRoute.BRIEF_DETAIL(params.briefId));
      })
      .catch((error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        const status = (error as { status?: unknown })?.status;
        if (status === 404) {
          // Already claimed by this account (e.g. at login) — go to the brief.
          removePublicBriefToken(params.briefId);
          router.replace(AppRoute.BRIEF_DETAIL(params.briefId));
          return;
        }
        if (status === 403) {
          // Client logged in under an email that does not match the brief.
          removePublicBriefToken(params.briefId);
          setState('mismatch');
          return;
        }
        logger.error('Failed to claim brief:', error);
        message.error(t('UNEXPECTED_ERROR'));
        router.replace(AppRoute.DASHBOARD);
      });

    return () => clearTimeout(timeoutId);
  }, [params.briefId, sessionStatus, isClient]);

  if (state === 'no_access') {
    return (
      <Result
        status='403'
        title={t('BRIEF_CLAIM_NO_ACCESS_TITLE')}
        subTitle={t('BRIEF_CLAIM_NO_ACCESS')}
        extra={
          <Button type='primary' onClick={() => router.replace(AppRoute.DASHBOARD)}>
            {t('GO_TO_DASHBOARD')}
          </Button>
        }
      />
    );
  }

  if (state === 'mismatch') {
    return (
      <Result
        status='warning'
        title={t('BRIEF_CLAIM_EMAIL_MISMATCH_TITLE')}
        subTitle={t('BRIEF_CLAIM_EMAIL_MISMATCH')}
        extra={
          <Button type='primary' onClick={() => router.replace(AppRoute.DASHBOARD)}>
            {t('GO_TO_DASHBOARD')}
          </Button>
        }
      />
    );
  }

  return <PageSpinner />;
};

export default BriefClaimPage;
