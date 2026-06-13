'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { App, Avatar, Button, Result, Spin, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import {
  useGetPublicBriefBySlugQuery,
  useCreatePublicBriefDraftBySlugMutation,
  savePublicBriefToken,
} from '@/services/client/publicBriefApi';
import { GROUPS } from '@/constants/constants';

import styles from './page.module.css';

export default function BrandedBriefStartPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const slug = params.slug as string;

  const { data: slugInfo, isLoading, isError } = useGetPublicBriefBySlugQuery(slug);
  const [createDraft] = useCreatePublicBriefDraftBySlugMutation();
  const [isStarting, setIsStarting] = useState(false);

  const group = session?.user?.group;
  const isClient = sessionStatus === 'authenticated' && group === GROUPS.client;

  if (isClient) {
    router.replace(AppRoute.BRANDED_BRIEF(slug) + '?authed=1');
    return (
      <div className={styles.centerWrapper}>
        <Spin size='large' />
      </div>
    );
  }

  if (isLoading || sessionStatus === 'loading') {
    return (
      <div className={styles.centerWrapper}>
        <Spin size='large' />
      </div>
    );
  }

  if (isError || !slugInfo?.valid) {
    return (
      <div className={styles.centerWrapper}>
        <Result status='404' title={t('BRANDED_BRIEF_NOT_FOUND_TITLE')} subTitle={t('BRANDED_BRIEF_NOT_FOUND_DESC')} />
      </div>
    );
  }

  const handleStart = async () => {
    if (isStarting) {
      return;
    }
    setIsStarting(true);
    try {
      const result = await createDraft(slug).unwrap();
      savePublicBriefToken(result.briefId, result.token);
      router.push(AppRoute.BRANDED_BRIEF_DETAIL(slug, result.briefId));
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
      setIsStarting(false);
    }
  };

  const handleLogin = () => {
    router.push(`/auth/login?next=${encodeURIComponent(AppRoute.BRANDED_BRIEF(slug))}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.loginHint}>
          <span className={styles.loginHintText}>{t('BRANDED_BRIEF_LOGIN_HINT')}</span>
          <Button type='link' size='small' onClick={handleLogin} className={styles.loginLink}>
            {t('BRANDED_BRIEF_LOGIN_LINK')}
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.branding}>
            {slugInfo.vendorLogoUrl ? (
              <img src={slugInfo.vendorLogoUrl} alt={slugInfo.vendorName} className={styles.logo} />
            ) : (
              <Avatar size={72} icon={<UserOutlined />} className={styles.logoFallback} />
            )}
            <Typography.Title level={3} className={styles.vendorName}>
              {t('BRANDED_BRIEF_FOR', slugInfo.vendorName)}
            </Typography.Title>
          </div>
          <Button
            type='primary'
            size='large'
            block
            loading={isStarting}
            onClick={handleStart}
            className={styles.startButton}
          >
            {t('BRANDED_BRIEF_START_BUTTON')}
          </Button>
        </div>
      </main>
    </div>
  );
}
