'use client';

import React, { use, useCallback, useMemo, useState } from 'react';
import { App, Button, Select, Skeleton } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { GROUPS } from '@/constants/constants';
import { useGetShareByTokenQuery, useGetShareExportDataQuery, useLinkShareToBriefMutation } from '@/services/client/sharesApi';
import { useGetBriefsQuery, useCreateBriefMutation } from '@/services/client/briefApi';
import { CoverPage } from '@/modules/vendor/export/CoverPage';
import { TopSheet } from '@/modules/vendor/export/TopSheet';
import { AssumptionsPage } from '@/modules/vendor/export/AssumptionsPage';
import { BudgetDetail } from '@/modules/vendor/export/BudgetDetail';
import { NewBrief } from '@/types/brief.interface';
import logger from '@/lib/logger';
import LogoIcon from '@/icons/aivus-logo.svg';
import {
  PageContainer,
  PublicHeader,
  LogoArea,
  MainContent,
  GuestBanner,
  BannerText,
  BannerActions,
  LoginLink,
  AuthorBanner,
  AuthorBannerText,
  EditLink,
  InfoBar,
  InfoBarText,
  ClientPanel,
  ClientLabel,
  FullPageMessage,
  ErrorTitle,
  ErrorSubtitle,
  OfferTableWrapper,
} from './styled';

const CREATE_NEW_VALUE = 'create-new';

interface PublicOfferViewProps {
  params: Promise<{ token: string }>;
}

export const PublicOfferView: React.FC<PublicOfferViewProps> = ({ params }) => {
  const { token } = use(params);
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

  const { data: briefs = [] } = useGetBriefsQuery(undefined, { skip: !isClient });
  const [linkShareToBrief, { isLoading: isLinking }] = useLinkShareToBriefMutation();
  const [createBrief] = useCreateBriefMutation();

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
        const newBrief = await createBrief({ details: {} as NewBrief['details'], status: 'DRAFT' }).unwrap();
        briefId = newBrief.id;
      }

      await linkShareToBrief({ token, briefId }).unwrap();
      setAddedBriefId(selectedBriefId);
      message.success(t('ESTIMATE_ADDED_TO_BRIEF', 'Brief'));
    } catch (err) {
      logger.error('Error linking offer to brief:', err);
      message.error(t('ERROR_ADDING_TO_BRIEF'));
    }
  }, [selectedBriefId, token, createBrief, linkShareToBrief, message]);

  const briefOptions = useMemo(() => {
    const options = briefs.map((x) => ({
      value: x.id,
      label: x.details?.projectName || t('UNTITLED_BRIEF'),
    }));
    options.push({ value: CREATE_NEW_VALUE, label: t('CREATE_NEW_BRIEF') });
    return options;
  }, [briefs]);

  if (isLoading) {
    return (
      <PageContainer>
        <PublicHeader>
          <LogoArea>
            <LogoIcon />
          </LogoArea>
        </PublicHeader>
        <MainContent>
          <Skeleton active paragraph={{ rows: 8 }} />
        </MainContent>
      </PageContainer>
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
      <FullPageMessage>
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorSubtitle>{title}</ErrorSubtitle>
      </FullPageMessage>
    );
  }

  const viewerRole = getViewerRole();
  const { offer, vendor } = data;

  return (
    <PageContainer>
      <PublicHeader>
        <LogoArea>
          <Link href={AppRoute.HOME} style={{ display: 'flex', alignItems: 'center' }}>
            <LogoIcon />
          </Link>
        </LogoArea>
        {isAuthenticated && (
          <Link href={AppRoute.DASHBOARD}>
            <Button type="default" style={{ fontWeight: 600 }}>
              {t('DASHBOARD')}
            </Button>
          </Link>
        )}
      </PublicHeader>

      {viewerRole === 'vendor-other' && (
        <InfoBar>
          <InfoBarText>{t('SHARED_ESTIMATE_FROM', vendor?.name || '')}</InfoBarText>
        </InfoBar>
      )}

      <MainContent>
        {viewerRole === 'guest' && (
          <GuestBanner>
            <BannerText>{t('SIGN_UP_TO_SAVE_ESTIMATE')}</BannerText>
            <BannerActions>
              <Button
                type="primary"
                onClick={handleSignUp}
                style={{
                  height: 36,
                  padding: '8px 26px',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                {t('SIGN_UP_FREE')}
              </Button>
              <LoginLink href={`${AppRoute.AUTH}?redirect=/public/${token}`}>
                {t('LOG_IN')}
              </LoginLink>
            </BannerActions>
          </GuestBanner>
        )}

        {viewerRole === 'vendor-author' && (
          <AuthorBanner>
            <AuthorBannerText>{t('THIS_IS_YOUR_ESTIMATE')}</AuthorBannerText>
            <EditLink href={offer.projectId ? AppRoute.DASHBOARD_PROJECT_ESTIMATION(offer.projectId) : '#'}>
              {t('EDIT_IN_DASHBOARD')}
            </EditLink>
          </AuthorBanner>
        )}

        {viewerRole === 'client' && (
          <ClientPanel>
            <ClientLabel>{t('ADD_TO_BRIEF')}</ClientLabel>
            <Select
              placeholder={t('SELECT_OPTION')}
              style={{
                width: 300,
                height: 40,
              }}
              onChange={(value) => setSelectedBriefId(value)}
              value={selectedBriefId}
              options={briefOptions}
            />
            <Button
              type="primary"
              onClick={handleAddToBrief}
              loading={isLinking}
              disabled={!selectedBriefId || addedBriefId === selectedBriefId}
              style={{
                height: 40,
                padding: '8px 26px',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {addedBriefId === selectedBriefId ? t('ADDED') : t('ADD')}
            </Button>
          </ClientPanel>
        )}

        <OfferTableWrapper>
          {exportError ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 14,
              color: '#99A1B7',
            }}>
              {t('FAILED_TO_LOAD_ESTIMATE')}
            </div>
          ) : isExportLoading || !exportData ? (
            <div style={{ padding: '40px' }}>
              <Skeleton active paragraph={{ rows: 12 }} />
            </div>
          ) : (
            <div style={{ padding: '40px' }}>
              <CoverPage data={exportData} />
              <div style={{ height: 32 }} />
              <TopSheet data={exportData} />
              <div style={{ height: 32 }} />
              <AssumptionsPage data={exportData} />
              <BudgetDetail data={exportData} />
            </div>
          )}
        </OfferTableWrapper>
      </MainContent>
    </PageContainer>
  );
};
