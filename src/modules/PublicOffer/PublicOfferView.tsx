'use client';

import React, { use, useCallback, useState } from 'react';
import { Button, Select, Skeleton, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { GROUPS } from '@/constants/constants';
import { useGetShareByTokenQuery } from '@/services/client/sharesApi';
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
  const { data, isLoading, error } = useGetShareByTokenQuery(token);
  const [addedBriefId, setAddedBriefId] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);

  const userGroup = session?.data?.user?.group;
  const isAuthenticated = session?.status === 'authenticated';

  // Determine viewer role
  const getViewerRole = useCallback((): 'guest' | 'vendor-author' | 'vendor-other' | 'client' => {
    if (!isAuthenticated) return 'guest';
    if (data?.viewerRole) return data.viewerRole;
    if (userGroup === GROUPS.client) return 'client';
    if (userGroup === GROUPS.vendor) return 'vendor-other';
    return 'guest';
  }, [isAuthenticated, data?.viewerRole, userGroup]);

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
    const isDisabled = (error as { status?: number })?.status === 403;
    return (
      <FullPageMessage>
        <ErrorTitle>
          {isDisabled ? t('SHARING_DISABLED_BY_OWNER') : t('ESTIMATE_NO_LONGER_AVAILABLE')}
        </ErrorTitle>
        <ErrorSubtitle>
          {isDisabled
            ? t('SHARING_DISABLED_BY_OWNER')
            : t('ESTIMATE_NO_LONGER_AVAILABLE')}
        </ErrorSubtitle>
      </FullPageMessage>
    );
  }

  const viewerRole = getViewerRole();
  const { share, offer } = data;

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
          <InfoBarText>{t('SHARED_ESTIMATE_FROM', share.vendorName || '')}</InfoBarText>
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
            <EditLink href={share.projectId ? AppRoute.DASHBOARD_PROJECT_ESTIMATION(share.projectId) : '#'}>
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
            {share.vendorName && (
              <div style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: '#99A1B7',
              }}>
                {t('BY_VENDOR', share.vendorName)}
              </div>
            )}
          </div>

          {/* Offer details would be rendered here using the offer data */}
          {/* For now, render a read-only representation of the offer details */}
          <ReadOnlyOfferDetails details={offer.details} />
        </OfferTableWrapper>
      </MainContent>
    </PageContainer>
  );
};

/** Minimal read-only offer details renderer for public page */
function ReadOnlyOfferDetails({ details }: { details: Record<string, unknown> }) {
  if (!details || Object.keys(details).length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#99A1B7' }}>
        {t('NO_ESTIMATE_DETAILS')}
      </div>
    );
  }

  // Cast to typed details if available
  const offerDetails = details as {
    categories?: Array<{ id: string; name: string; parentCategoryId?: string | null }>;
    offers?: Array<{
      id: string;
      item: string;
      clientPrice: number;
      clientCost: number;
      categoryId: string;
      units?: Array<{ label: string; count: number } | null>;
    }>;
  };

  const categories = offerDetails.categories?.filter((c) => !c.parentCategoryId) || [];

  if (categories.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#99A1B7' }}>
        {t('NO_ESTIMATE_DETAILS')}
      </div>
    );
  }

  return (
    <div>
      {categories.map((category) => {
        const items = offerDetails.offers?.filter((o) => o.categoryId === category.id) || [];
        return (
          <div key={category.id} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: '#2288FF',
                textTransform: 'uppercase',
                padding: '12px 0',
                borderBottom: '1px dashed #D9D9D9',
              }}
            >
              {category.name}
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 100px',
                  padding: '10px 0',
                  borderBottom: '1px dashed #E1E3EA',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#4B5675',
                }}
              >
                <div>{item.item}</div>
                <div style={{ textAlign: 'right' }}>
                  ${item.clientPrice?.toFixed(2) || '0.00'}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {item.units
                    ?.filter(Boolean)
                    .map((u) => `${u!.count} ${u!.label}`)
                    .join(', ') || '-'}
                </div>
                <div style={{ textAlign: 'right', fontWeight: 600 }}>
                  ${item.clientCost?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
