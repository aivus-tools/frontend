'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { App } from 'antd';
import { PageSpinner } from '@/components/PageSpinner';
import {
  useClaimPublicBriefMutation,
  getPublicBriefToken,
  removePublicBriefToken,
} from '@/services/client/publicBriefApi';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';

const CLAIM_TIMEOUT_MS = 10000;

const BriefClaimPage = () => {
  const params = useParams<{ briefId: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const [claimBrief] = useClaimPublicBriefMutation();
  const claimed = useRef(false);

  useEffect(() => {
    if (claimed.current || !params.briefId) {
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
          removePublicBriefToken(params.briefId);
          router.replace(AppRoute.BRIEF_DETAIL(params.briefId));
          return;
        }
        logger.error('Failed to claim brief:', error);
        message.error(t('UNEXPECTED_ERROR'));
        router.replace(AppRoute.DASHBOARD);
      });

    return () => clearTimeout(timeoutId);
  }, [params.briefId]);

  return <PageSpinner />;
};

export default BriefClaimPage;
