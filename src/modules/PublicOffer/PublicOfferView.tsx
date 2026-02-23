'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { Button, Select, Skeleton, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { GROUPS } from '@/constants/constants';
import { useGetShareByTokenQuery } from '@/services/client/sharesApi';
import { useAppDispatch } from '@/store/hooks';
import { setOfferDetails } from '@/store/slices/offer/slice';
import { OfferDetails } from '@/types/store.interface';
import { ClientOfferTable } from '@/modules/vendor/client-offer/ClientOfferTable';
import { GuidanceProvider } from '@/context/GuidanceProvider';
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

interface PublicOfferViewProps {
  params: Promise<{ token: string }>;
}

export const PublicOfferView: React.FC<PublicOfferViewProps> = ({ params }) => {
  const { token } = use(params);
  const router = useRouter();
  const session = useSession();
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useGetShareByTokenQuery(token);
  const [addedBriefId, setAddedBriefId] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);

  useEffect(() => {
    if (data?.offer?.details) {
      dispatch(setOfferDetails(data.offer.details as unknown as OfferDetails));
    }
  }, [data, dispatch]);

  const userGroup = session?.data?.user?.group;
  const isAuthenticated = session?.status === 'authenticated';

  // Determine viewer role
  const getViewerRole = useCallback((): 'guest' | 'vendor-author' | 'vendor-other' | 'client' => {
    if (!isAuthenticated) return 'guest';
    if (userGroup === GROUPS.client) return 'client';
    if (userGroup === GROUPS.vendor) {
      // Check if this vendor owns the offer
      const userId = session?.data?.user?.vendorId;
      if (userId && data?.vendor?.id === userId) return 'vendor-author';
      return 'vendor-other';
    }
    return 'guest';
  }, [isAuthenticated, userGroup, session?.data?.user?.vendorId, data?.vendor?.id]);

  const handleSignUp = useCallback(() => {
    router.push(`${AppRoute.AUTH}?redirect=/public/${token}`);
  }, [router, token]);

  const handleAddToBrief = useCallback(() => {
    if (!selectedBriefId) return;
    // POST to link offer to brief
    setAddedBriefId(selectedBriefId);
    message.success(t('ESTIMATE_ADDED_TO_BRIEF', 'Brief'));
  }, [selectedBriefId]);

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

      {/* Vendor-other Info Bar */}
      {viewerRole === 'vendor-other' && (
        <InfoBar>
          <InfoBarText>{t('SHARED_ESTIMATE_FROM', vendor?.name || '')}</InfoBarText>
        </InfoBar>
      )}

      <MainContent>
        {/* Guest Banner */}
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

        {/* Vendor-author Banner */}
        {viewerRole === 'vendor-author' && (
          <AuthorBanner>
            <AuthorBannerText>{t('THIS_IS_YOUR_ESTIMATE')}</AuthorBannerText>
            <EditLink href={offer.projectId ? AppRoute.DASHBOARD_PROJECT_ESTIMATION(offer.projectId) : '#'}>
              {t('EDIT_IN_DASHBOARD')}
            </EditLink>
          </AuthorBanner>
        )}

        {/* Client Action Panel */}
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
              options={[
                // Brief options would be dynamically loaded
                { value: 'create-new', label: t('CREATE_NEW_BRIEF') },
              ]}
            />
            <Button
              type="primary"
              onClick={handleAddToBrief}
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

        {/* Read-only Offer Table */}
        <OfferTableWrapper>
          <div style={{ padding: '20px 0' }}>
            <h2 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: '#4B5675',
              margin: '0 0 8px 0',
            }}>
              {offer.projectName}
            </h2>
            {vendor?.name && (
              <div style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: '#99A1B7',
              }}>
                {t('BY_VENDOR', vendor.name)}
              </div>
            )}
          </div>

          <GuidanceProvider>
            <ClientOfferTable />
          </GuidanceProvider>
        </OfferTableWrapper>
      </MainContent>
    </PageContainer>
  );
};
