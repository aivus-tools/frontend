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

    const token = getPublicBriefToken(params.briefId);
    if (!token) {
      message.error(t('UNEXPECTED_ERROR'));
      router.replace(AppRoute.DASHBOARD);
      return;
    }

    claimBrief({ briefId: params.briefId, token })
      .unwrap()
      .then(() => {
        removePublicBriefToken(params.briefId);
        router.replace(AppRoute.BRIEF_DETAIL(params.briefId));
      })
      .catch((error) => {
        logger.error('Failed to claim brief:', error);
        message.error(t('UNEXPECTED_ERROR'));
        router.replace(AppRoute.DASHBOARD);
      });
  }, [params.briefId]);

  return <PageSpinner />;
};

export default BriefClaimPage;
