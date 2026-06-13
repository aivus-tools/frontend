'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { App, Button, Empty, Spin, Tabs } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import {
  getPublicBriefToken,
  savePublicBriefToken,
  useGetPublicBriefBySlugQuery,
  useGetPublicBriefDetailQuery,
} from '@/services/client/publicBriefApi';
import { GROUPS } from '@/constants/constants';
import { AnonymousBriefEditor } from '@/modules/client/BriefEditor/AnonymousBriefEditor';
import { WhiteLabelDocumentPanel } from '@/modules/client/BriefEditor/WhiteLabelDocumentPanel';
import { SendBriefModal } from '@/modules/client/BriefEditor/SendBriefModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageSpinner } from '@/components/PageSpinner/PageSpinner';

import styles from './page.module.css';

export default function BrandedBriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const { isMobile, ready: breakpointReady } = useBreakpoint();
  const slug = params.slug as string;
  const briefId = params.briefId as string;
  const [mobileTab, setMobileTab] = useState<'brief' | 'chat'>('chat');
  const [sendModalOpen, setSendModalOpen] = useState(false);
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
  const { data: detail } = useGetPublicBriefDetailQuery(
    { briefId, token: token ?? '' },
    { skip: !canQueryDetail || isClient }
  );

  const conversationStatus = detail?.conversationStatus ?? 'in_progress';
  const isSendEnabled = conversationStatus === 'ready_to_finalize' || conversationStatus === 'finalized';

  const handleBriefCreated = (newBriefId: string, newToken?: string) => {
    if (newToken) {
      savePublicBriefToken(newBriefId, newToken);
      setToken(newToken);
    }
  };

  const handleRegisterClick = (currentBriefId: string | null, currentToken: string | null, email: string | null) => {
    if (currentBriefId && currentToken) {
      savePublicBriefToken(currentBriefId, currentToken);
    }
    router.push(email ? `/auth?email=${encodeURIComponent(email)}` : '/auth');
  };

  const handleSendSuccess = () => {
    router.push(AppRoute.BRANDED_BRIEF_SUCCESS(slug));
  };

  if (isClient) {
    return <PageSpinner />;
  }

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

        {mobileTab === 'chat' ? (
          <div className={styles.mobileChatPane}>
            <AnonymousBriefEditor
              briefId={briefId}
              token={token}
              onBriefCreated={handleBriefCreated}
              onRegisterClick={handleRegisterClick}
            />
          </div>
        ) : (
          <div className={styles.mobileDocPane}>
            {token ? (
              <WhiteLabelDocumentPanel briefId={briefId} token={token} />
            ) : (
              <div className={styles.centerWrapper}>
                <Empty description={t('BRIEF_V3_DOCUMENT_MISSING')} />
              </div>
            )}
          </div>
        )}

        {sendModalOpen ? (
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
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.desktopWrapper}>
      <div className={styles.desktopHeader}>
        <div className={styles.desktopHeaderTitle}>{t('BRANDED_BRIEF_FOR', vendorName)}</div>
        <div className={styles.desktopHeaderActions}>{sendButton}</div>
      </div>
      <div className={styles.desktopContent}>
        <div className={styles.desktopDocPane}>
          {token ? (
            <WhiteLabelDocumentPanel briefId={briefId} token={token} />
          ) : (
            <div className={styles.centerWrapper}>
              <Empty description={t('BRIEF_V3_DOCUMENT_MISSING')} />
            </div>
          )}
        </div>
        <div className={styles.desktopChatPane}>
          <AnonymousBriefEditor
            briefId={briefId}
            token={token}
            onBriefCreated={handleBriefCreated}
            onRegisterClick={handleRegisterClick}
          />
        </div>
      </div>

      {sendModalOpen ? (
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
      ) : null}
    </div>
  );
}
