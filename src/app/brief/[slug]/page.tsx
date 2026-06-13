'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { setPendingBrief, setAuthReturnUrl, saveDraftForSlug, getDraftForSlug } from '@/helpers/pendingBrief';
import { useCreateBriefAiDraftMutation, useGetSentBriefIdsToVendorQuery } from '@/services/client/briefAiApi';
import { GROUPS } from '@/constants/constants';
import { BriefSelectModal } from '@/modules/client/BriefEditor/BriefSelectModal';

import styles from './page.module.css';

export default function BrandedBriefStartPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const slug = params.slug as string;
  const isAuthed = searchParams.get('authed') === '1';
  const isEmbed = searchParams.get('embed') === '1';

  const { data: slugInfo, isLoading, isError } = useGetPublicBriefBySlugQuery(slug);
  const [createAnonDraft] = useCreatePublicBriefDraftBySlugMutation();
  const [createAuthDraft] = useCreateBriefAiDraftMutation();
  const [isStarting, setIsStarting] = useState(false);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  const group = session?.user?.group;
  const isClient = sessionStatus === 'authenticated' && group === GROUPS.client;
  const isVendor = sessionStatus === 'authenticated' && group === GROUPS.vendor;

  const { data: sentBriefIdsData } = useGetSentBriefIdsToVendorQuery(slug, { skip: !isClient });

  useEffect(() => {
    if (isVendor) {
      router.replace(AppRoute.DASHBOARD);
    }
  }, [isVendor, router]);

  useEffect(() => {
    if (isClient && !isAuthed) {
      router.replace(AppRoute.BRANDED_BRIEF(slug) + '?authed=1');
    }
  }, [isClient, isAuthed, router, slug]);

  useEffect(() => {
    if (isClient && isAuthed && slugInfo?.valid) {
      setSelectModalOpen(true);
    }
  }, [isClient, isAuthed, slugInfo?.valid]);

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

  const embedSuffix = isEmbed ? '?embed=1' : '';

  const handleAnonStart = async () => {
    if (isStarting) {
      return;
    }

    const existing = getDraftForSlug(slug);
    if (existing) {
      router.push(AppRoute.BRANDED_BRIEF_DETAIL(slug, existing.briefId) + embedSuffix);
      return;
    }

    setIsStarting(true);
    try {
      const result = await createAnonDraft(slug).unwrap();
      savePublicBriefToken(result.briefId, result.token);
      setPendingBrief(result.briefId, result.token);
      saveDraftForSlug(slug, result.briefId, result.token);
      router.push(AppRoute.BRANDED_BRIEF_DETAIL(slug, result.briefId) + embedSuffix);
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
      setIsStarting(false);
    }
  };

  const handleAuthNewBrief = async () => {
    if (isStarting) {
      return;
    }
    setIsStarting(true);
    try {
      const result = await createAuthDraft().unwrap();
      router.push(AppRoute.BRANDED_BRIEF_DETAIL(slug, result.briefId) + embedSuffix);
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
      setIsStarting(false);
    }
  };

  const handleAuthSelectExisting = (briefId: string) => {
    router.push(AppRoute.BRANDED_BRIEF_DETAIL(slug, briefId) + embedSuffix);
  };

  const handleLogin = () => {
    setAuthReturnUrl(AppRoute.BRANDED_BRIEF(slug));
    const loginUrl = AppRoute.AUTH;
    if (isEmbed) {
      window.open(loginUrl, '_blank');
    } else {
      router.push(loginUrl);
    }
  };

  if (isClient && isAuthed) {
    return (
      <div className={styles.pageWrapper}>
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
              onClick={() => setSelectModalOpen(true)}
              className={styles.startButton}
            >
              {t('BRANDED_BRIEF_START_BUTTON')}
            </Button>
          </div>
        </main>

        <BriefSelectModal
          value={selectModalOpen}
          onChange={setSelectModalOpen}
          vendorName={slugInfo.vendorName}
          sentBriefIds={sentBriefIdsData?.briefIds ?? []}
          onSelectNew={handleAuthNewBrief}
          onSelectExisting={handleAuthSelectExisting}
        />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {!isEmbed ? (
        <header className={styles.header}>
          <div className={styles.loginHint}>
            <span className={styles.loginHintText}>{t('BRANDED_BRIEF_LOGIN_HINT')}</span>
            <Button type='link' size='small' onClick={handleLogin} className={styles.loginLink}>
              {t('BRANDED_BRIEF_LOGIN_LINK')}
            </Button>
          </div>
        </header>
      ) : null}

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
            onClick={handleAnonStart}
            className={styles.startButton}
          >
            {t('BRANDED_BRIEF_START_BUTTON')}
          </Button>
        </div>
      </main>
    </div>
  );
}
