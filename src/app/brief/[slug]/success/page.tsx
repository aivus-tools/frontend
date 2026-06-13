'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button, Result, Spin } from 'antd';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useGetPublicBriefBySlugQuery } from '@/services/client/publicBriefApi';
import { GROUPS } from '@/constants/constants';

import styles from './page.module.css';

export default function BrandedBriefSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const slug = params.slug as string;
  const { data: slugInfo, isLoading } = useGetPublicBriefBySlugQuery(slug);

  const isClient = sessionStatus === 'authenticated' && session?.user?.group === GROUPS.client;

  if (isLoading || sessionStatus === 'loading') {
    return (
      <div className={styles.centerWrapper}>
        <Spin size='large' />
      </div>
    );
  }

  const vendorName = slugInfo?.vendorName ?? '';

  const extra = isClient ? (
    <Button type='primary' onClick={() => router.push(AppRoute.DASHBOARD)}>
      {t('BRANDED_BRIEF_SUCCESS_GO_BRIEFS')}
    </Button>
  ) : null;

  return (
    <div className={styles.centerWrapper}>
      <Result
        status='success'
        title={t('BRANDED_BRIEF_SUCCESS_TITLE')}
        subTitle={isClient ? t('BRANDED_BRIEF_SUCCESS_AUTH_DESC', vendorName) : t('BRANDED_BRIEF_SUCCESS_ANON_DESC')}
        extra={extra}
      />
    </div>
  );
}
