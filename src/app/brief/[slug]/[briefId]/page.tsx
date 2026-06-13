'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { App, Button, Empty, Spin, Tabs, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import {
  getPublicBriefToken,
  savePublicBriefToken,
  useGetPublicBriefBySlugQuery,
  useGetPublicBriefDetailQuery,
} from '@/services/client/publicBriefApi';
import { useGetBriefAiDetailQuery, useGetSentBriefIdsToVendorQuery } from '@/services/client/briefAiApi';
import { setPendingBrief, isBriefSent, markBriefAsSent, clearDraftForSlug } from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';
import { AnonymousBriefEditor } from '@/modules/client/BriefEditor/AnonymousBriefEditor';
import { AuthenticatedBriefEditor } from '@/modules/client/BriefEditor/AuthenticatedBriefEditor';
import {
  WhiteLabelDocumentPanel,
  WhiteLabelDocumentHandle,
} from '@/modules/client/BriefEditor/WhiteLabelDocumentPanel';
import { SendBriefModal } from '@/modules/client/BriefEditor/SendBriefModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageSpinner } from '@/components/PageSpinner/PageSpinner';

import styles from './page.module.css';

export default function BrandedBriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const { isMobile, ready: breakpointReady } = useBreakpoint();
  const slug = params.slug as string;
  const briefId = params.briefId as string;
  const isEmbed = searchParams.get('embed') === '1';
  const [mobileTab, setMobileTab] = useState<'brief' | 'chat'>('chat');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const docPanelRef = useRef<WhiteLabelDocumentHandle | null>(null);

  const getLatestDocumentHtml = useCallback((): string | null => {
    return docPanelRef.current?.getLatestHtml() ?? null;
  }, []);
  const tokenFromStorage = typeof window !== 'undefined' ? getPublicBriefToken(briefId) : null;
  const [token, setToken] = useState<string | null>(tokenFromStorage);

  const { data: slugInfo, isLoading: isSlugLoading } = useGetPublicBriefBySlugQuery(slug);

  const group = session?.user?.group;
  const isClient = sessionStatus === 'authenticated' && group === GROUPS.client;
  const isVendor = sessionStatus === 'authenticated' && group === GROUPS.vendor;

  useEffect(() => {
    if (isVendor) {
      message.warning(t('BRIEF_LINK_CLIENTS_ONLY'));
      router.replace(AppRoute.DASHBOARD);
    }
  }, [isVendor, message, router]);

  const canQueryDetail = !!briefId && !!token;
  const { data: publicDetail } = useGetPublicBriefDetailQuery(
    { briefId, token: token ?? '' },
    { skip: !canQueryDetail || isClient }
  );

  const { data: authDetail } = useGetBriefAiDetailQuery(briefId, {
    skip: !isClient || !briefId,
    refetchOnMountOrArgChange: true,
  });

  const { data: sentBriefIdsData } = useGetSentBriefIdsToVendorQuery(slug, { skip: !isClient });

  const conversationStatus = isClient
    ? (authDetail?.conversationStatus ?? 'in_progress')
    : (publicDetail?.conversationStatus ?? 'in_progress');

  const documentReady = conversationStatus === 'ready_to_finalize' || conversationStatus === 'finalized';
  const anonAlreadySent = !isClient && isBriefSent(briefId);
  const alreadySent = isClient ? !!(sentBriefIdsData?.briefIds ?? []).includes(briefId) : anonAlreadySent;
  const isSendEnabled = documentReady && !alreadySent;

  const handleBriefCreated = (newBriefId: string, newToken?: string) => {
    if (newToken) {
      savePublicBriefToken(newBriefId, newToken);
      setToken(newToken);
    }
  };

  const handleRegisterClick = (currentBriefId: string | null, currentToken: string | null, email: string | null) => {
    if (currentBriefId && currentToken) {
      savePublicBriefToken(currentBriefId, currentToken);
      setPendingBrief(currentBriefId, currentToken);
    }
    router.push(email ? `/auth?email=${encodeURIComponent(email)}` : '/auth');
  };

  const handleSendSuccess = () => {
    if (!isClient) {
      markBriefAsSent(briefId);
      clearDraftForSlug(slug);
    }
    router.push(AppRoute.BRANDED_BRIEF_SUCCESS(slug) + (isEmbed ? '?embed=1' : ''));
  };

  if (isVendor) {
    return <PageSpinner />;
  }

  if (!breakpointReady || isSlugLoading || sessionStatus === 'loading') {
    return (
      <div className={styles.centerWrapper}>
        <Spin size='large' />
      </div>
    );
  }

  if (!slugInfo?.valid) {
    return (
      <div className={styles.centerWrapper}>
        <Empty description={t('BRANDED_BRIEF_NOT_FOUND_TITLE')} />
      </div>
    );
  }

  const vendorName = slugInfo.vendorName;

  const sendButton = (
    <Button
      type='primary'
      icon={<SendOutlined />}
      disabled={!isSendEnabled}
      title={isSendEnabled ? undefined : t('BRANDED_BRIEF_SEND_DISABLED_HINT')}
      onClick={() => setSendModalOpen(true)}
    >
      {t('BRANDED_BRIEF_SEND')}
    </Button>
  );

  const anonDocumentPanel = token ? (
    documentReady ? (
      <WhiteLabelDocumentPanel ref={docPanelRef} briefId={briefId} token={token} />
    ) : (
      <div className={styles.centerWrapper}>
        <Typography.Text type='secondary'>{t('BRIEF_V3_DOCUMENT_NOT_READY')}</Typography.Text>
      </div>
    )
  ) : (
    <div className={styles.centerWrapper}>
      <Empty description={t('BRIEF_V3_DOCUMENT_MISSING')} />
    </div>
  );

  const sendModal = sendModalOpen ? (
    <SendBriefModal
      value={sendModalOpen}
      onChange={setSendModalOpen}
      briefId={briefId}
      slug={slug}
      vendorName={vendorName}
      isAnon={!isClient}
      token={token}
      onSuccess={handleSendSuccess}
    />
  ) : null;

  if (isClient) {
    return (
      <div className={styles.desktopWrapper}>
        <div className={styles.desktopHeader}>
          {!isEmbed ? (
            <div className={styles.desktopHeaderTitle}>{t('BRANDED_BRIEF_FOR', vendorName)}</div>
          ) : (
            <div className={styles.desktopHeaderTitle} />
          )}
          <div className={styles.desktopHeaderActions}>{sendButton}</div>
        </div>
        <div className={styles.desktopContent}>
          <AuthenticatedBriefEditor briefId={briefId} whiteLabel={true} />
        </div>
        {sendModal}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.mobileWrapper}>
        <div className={styles.mobileTabsHeader}>
          <Tabs
            activeKey={mobileTab}
            onChange={(key) => setMobileTab(key as 'brief' | 'chat')}
            items={[
              { key: 'chat', label: t('BRIEF_TAB_CHAT') },
              { key: 'brief', label: t('BRIEF_TAB_BRIEF') },
            ]}
            size='small'
            className={styles.mobileTabs}
          />
          <div className={styles.mobileSendAction}>{sendButton}</div>
        </div>

        <div className={`${styles.mobileChatPane}${mobileTab !== 'chat' ? ` ${styles.mobileHidden}` : ''}`}>
          <AnonymousBriefEditor
            briefId={briefId}
            token={token}
            whiteLabel={true}
            getLatestDocumentHtml={getLatestDocumentHtml}
            onBriefCreated={handleBriefCreated}
            onRegisterClick={handleRegisterClick}
          />
        </div>
        <div className={`${styles.mobileDocPane}${mobileTab !== 'brief' ? ` ${styles.mobileHidden}` : ''}`}>
          {anonDocumentPanel}
        </div>

        {sendModal}
      </div>
    );
  }

  return (
    <div className={styles.desktopWrapper}>
      {!isEmbed ? (
        <div className={styles.desktopHeader}>
          <div className={styles.desktopHeaderTitle}>{t('BRANDED_BRIEF_FOR', vendorName)}</div>
          <div className={styles.desktopHeaderActions}>{sendButton}</div>
        </div>
      ) : (
        <div className={styles.desktopHeader}>
          <div className={styles.desktopHeaderTitle} />
          <div className={styles.desktopHeaderActions}>{sendButton}</div>
        </div>
      )}
      <div className={styles.desktopContent}>
        <div className={styles.desktopDocPane}>{anonDocumentPanel}</div>
        <div className={styles.desktopChatPane}>
          <AnonymousBriefEditor
            briefId={briefId}
            token={token}
            whiteLabel={true}
            getLatestDocumentHtml={getLatestDocumentHtml}
            onBriefCreated={handleBriefCreated}
            onRegisterClick={handleRegisterClick}
          />
        </div>
      </div>

      {sendModal}
    </div>
  );
}
