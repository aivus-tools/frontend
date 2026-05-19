'use client';

import React, { use, useCallback, useMemo, useState } from 'react';
import { App, Button, Select, Skeleton } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { GROUPS } from '@/constants/constants';
import {
  useGetShareByTokenQuery,
  useGetShareExportDataQuery,
  useLinkShareToBriefMutation,
} from '@/services/client/sharesApi';
import { useGetBriefAiListQuery, useCreateBriefAiDraftMutation } from '@/services/client/briefAiApi';
import { CoverPage } from '@/modules/vendor/export/CoverPage';
import { TopSheet } from '@/modules/vendor/export/TopSheet';
import { AssumptionsPage } from '@/modules/vendor/export/AssumptionsPage';
import { BudgetDetail } from '@/modules/vendor/export/BudgetDetail';
import logger from '@/lib/logger';
import LogoIcon from '@/icons/aivus-logo.svg';
import { BetaBadge } from '@/components/BetaBadge/BetaBadge';
import { BetaFooter, BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';

import styles from './PublicOfferView.module.css';

const CREATE_NEW_VALUE = 'create-new';

interface PublicOfferViewProps {
  params: Promise<{ token: string }>;
}

export const PublicOfferView = (props: PublicOfferViewProps) => {
  const { token } = use(props.params);
  const router = useRouter();
  const session = useSession();
  const { message } = App.useApp();
  const { data, isLoading, error } = useGetShareByTokenQuery(token);
  const { data: exportData, isLoading: isExportLoading, error: exportError } = useGetShareExportDataQuery(token);
  const [addedBriefId, setAddedBriefId] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);

  const userGroup = session?.data?.user?.group;
  const isAuthenticated = session?.status === 'authenticated';
  const isClient = isAuthenticated && userGroup === GROUPS.client;

  const { data: briefs = [] } = useGetBriefAiListQuery(undefined, { skip: !isClient });
  const [linkShareToBrief, { isLoading: isLinking }] = useLinkShareToBriefMutation();
  const [createBriefDraft] = useCreateBriefAiDraftMutation();

  const getViewerRole = useCallback((): 'guest' | 'vendor-author' | 'vendor-other' | 'client' => {
    if (!isAuthenticated) {
      return 'guest';
    }
    if (userGroup === GROUPS.client) {
      return 'client';
    }
    if (userGroup === GROUPS.vendor) {
      const userId = session?.data?.user?.vendorId;
      if (userId && data?.vendor?.id === userId) {
        return 'vendor-author';
      }
      return 'vendor-other';
    }
    return 'guest';
  }, [isAuthenticated, userGroup, session?.data?.user?.vendorId, data?.vendor?.id]);

  const handleSignUp = useCallback(() => {
    router.push(`${AppRoute.AUTH}?redirect=/public/${token}`);
  }, [router, token]);

  const handleAddToBrief = useCallback(async () => {
    if (!selectedBriefId) {
      return;
    }

    try {
      let briefId = selectedBriefId;

      if (briefId === CREATE_NEW_VALUE) {
        const newBrief = await createBriefDraft().unwrap();
        briefId = newBrief.briefId;
      }

      await linkShareToBrief({ token, briefId }).unwrap();
      setAddedBriefId(selectedBriefId);
      message.success(t('ESTIMATE_ADDED_TO_BRIEF', 'Brief'));
    } catch (err) {
      logger.error('Error linking offer to brief:', err);
      message.error(t('ERROR_ADDING_TO_BRIEF'));
    }
  }, [selectedBriefId, token, createBriefDraft, linkShareToBrief, message]);

  const briefOptions = useMemo(() => {
    const options = briefs.map((x) => ({
      value: x.id,
      label: x.title || t('UNTITLED_BRIEF'),
    }));
    options.push({ value: CREATE_NEW_VALUE, label: t('CREATE_NEW_BRIEF') });
    return options;
  }, [briefs]);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.publicHeader}>
          <div className={styles.logoArea}>
            <LogoIcon />
            <BetaBadge size='sm' />
          </div>
        </header>
        <main className={styles.mainContent}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </main>
      </div>
    );
  }

  if (error || !data) {
    const status = (error as { status?: number })?.status;
    const errorMessage = (error as { data?: { error?: string } })?.data?.error;
    const isDisabled = status === 403;
    const isArchived = status === 410 && errorMessage === 'Project is archived';

    const title = isArchived
      ? t('PROJECT_ARCHIVED_UNAVAILABLE')
      : isDisabled
        ? t('SHARING_DISABLED_BY_OWNER')
        : t('ESTIMATE_NO_LONGER_AVAILABLE');

    return (
      <div className={styles.fullPageMessage}>
        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorSubtitle}>{title}</p>
      </div>
    );
  }

  const viewerRole = getViewerRole();
  const { offer, vendor } = data;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.publicHeader}>
        <div className={styles.logoArea}>
          <Link href={AppRoute.HOME} className={styles.logoLink}>
            <LogoIcon />
            <BetaBadge size='sm' />
          </Link>
        </div>
        {isAuthenticated && (
          <Link href={AppRoute.DASHBOARD}>
            <Button type='default' className={styles.dashboardButton}>
              {t('DASHBOARD')}
            </Button>
          </Link>
        )}
      </header>

      {viewerRole === 'vendor-other' && (
        <div className={styles.infoBar}>
          <span className={styles.infoBarText}>{t('SHARED_ESTIMATE_FROM', vendor?.name || '')}</span>
        </div>
      )}

      <main className={styles.mainContent}>
        {viewerRole === 'guest' && (
          <div className={styles.guestBanner}>
            <span className={styles.bannerText}>{t('SIGN_UP_TO_SAVE_ESTIMATE')}</span>
            <div className={styles.bannerActions}>
              <Button type='primary' onClick={handleSignUp} className={styles.signUpButton}>
                {t('SIGN_UP_FREE')}
              </Button>
              <a className={styles.loginLink} href={`${AppRoute.AUTH}?redirect=/public/${token}`}>
                {t('LOG_IN')}
              </a>
            </div>
          </div>
        )}

        {viewerRole === 'vendor-author' && (
          <div className={styles.authorBanner}>
            <span className={styles.authorBannerText}>{t('THIS_IS_YOUR_ESTIMATE')}</span>
            <a
              className={styles.editLink}
              href={offer.projectId ? AppRoute.DASHBOARD_PROJECT_ESTIMATION(offer.projectId) : '#'}
            >
              {t('EDIT_IN_DASHBOARD')}
            </a>
          </div>
        )}

        {viewerRole === 'client' && (
          <div className={styles.clientPanel}>
            <span className={styles.clientLabel}>{t('ADD_TO_BRIEF')}</span>
            <Select
              placeholder={t('SELECT_OPTION')}
              className={styles.clientBriefSelect}
              onChange={(value) => setSelectedBriefId(value)}
              value={selectedBriefId}
              options={briefOptions}
            />
            <Button
              type='primary'
              onClick={handleAddToBrief}
              loading={isLinking}
              disabled={!selectedBriefId || addedBriefId === selectedBriefId}
              className={styles.clientAddButton}
            >
              {addedBriefId === selectedBriefId ? t('ADDED') : t('ADD')}
            </Button>
          </div>
        )}

        <div className={styles.offerTableWrapper}>
          {exportError ? (
            <div className={styles.offerTableError}>{t('FAILED_TO_LOAD_ESTIMATE')}</div>
          ) : isExportLoading || !exportData ? (
            <div className={styles.offerTableInner}>
              <Skeleton active paragraph={{ rows: 12 }} />
            </div>
          ) : (
            <div className={styles.offerTableInner}>
              <CoverPage data={exportData} />
              <div className={styles.offerTableSpacer} />
              <TopSheet data={exportData} />
              <div className={styles.offerTableSpacer} />
              <AssumptionsPage data={exportData} />
              <BudgetDetail data={exportData} />
            </div>
          )}
        </div>
      </main>
      <div
        className={styles.footerSpacer}
        style={{ '--beta-footer-height': `${BETA_FOOTER_HEIGHT}px` } as React.CSSProperties}
      />
      <BetaFooter />
    </div>
  );
};
