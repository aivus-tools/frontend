'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Avatar, Button, Empty, Spin, Tabs } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import {
  getPublicBriefToken,
  savePublicBriefToken,
  useGetPublicBriefBySlugQuery,
  useGetPublicBriefDetailQuery,
} from '@/services/client/publicBriefApi';
import { useGetBriefAiDetailQuery, useGetSentBriefIdsToVendorQuery, briefAiApi } from '@/services/client/briefAiApi';
import { useAppDispatch } from '@/store/hooks';
import {
  setPendingBrief,
  isBriefSent,
  markBriefAsSent,
  clearDraftForSlug,
  getDraftForSlug,
} from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';
import { AnonymousBriefEditor } from './AnonymousBriefEditor';
import { AuthenticatedBriefEditor, AuthenticatedBriefEditorHandle } from './AuthenticatedBriefEditor';
import { WhiteLabelDocumentPanel, WhiteLabelDocumentHandle } from './WhiteLabelDocumentPanel';
import { SendBriefModal } from './SendBriefModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import styles from './BrandedBriefWorkspace.module.css';

interface BrandedBriefWorkspaceProps {
  slug: string;
  initialBriefId: string | null;
}

const resolveInitialToken = (briefId: string | null, slug: string): string | null => {
  if (typeof window === 'undefined' || !briefId) {
    return null;
  }
  const fromStorage = getPublicBriefToken(briefId);
  if (fromStorage) {
    return fromStorage;
  }
  const draft = getDraftForSlug(slug);
  if (draft && draft.briefId === briefId) {
    savePublicBriefToken(draft.briefId, draft.token);
    return draft.token;
  }
  return null;
};

export const BrandedBriefWorkspace = (props: BrandedBriefWorkspaceProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const { isMobile, ready: breakpointReady } = useBreakpoint();
  const dispatch = useAppDispatch();
  const slug = props.slug;
  const isEmbed = searchParams.get('embed') === '1';

  const [briefId, setBriefId] = useState<string | null>(props.initialBriefId);
  const [token, setToken] = useState<string | null>(() => resolveInitialToken(props.initialBriefId, slug));
  const [mobileTab, setMobileTab] = useState<'brief' | 'chat'>('chat');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const anonDocPanelRef = useRef<WhiteLabelDocumentHandle | null>(null);
  const authEditorRef = useRef<AuthenticatedBriefEditorHandle | null>(null);

  const getLatestDocumentHtml = useCallback((): string | null => {
    return anonDocPanelRef.current?.getProductionBriefHtml() ?? null;
  }, []);

  const { data: slugInfo, isLoading: isSlugLoading } = useGetPublicBriefBySlugQuery(slug);

  const group = session?.user?.group;
  const isClient = sessionStatus === 'authenticated' && group === GROUPS.client;

  // Resume an existing anonymous draft (cookie within 1h) without creating a new one.
  useEffect(() => {
    if (briefId || isClient || sessionStatus === 'loading') {
      return;
    }
    const draft = getDraftForSlug(slug);
    if (draft) {
      savePublicBriefToken(draft.briefId, draft.token);
      setBriefId(draft.briefId);
      setToken(draft.token);
    }
  }, [briefId, isClient, sessionStatus, slug]);

  const canQueryDetail = !!briefId && !!token;
  const { data: publicDetail } = useGetPublicBriefDetailQuery(
    { briefId: briefId ?? '', token: token ?? '' },
    { skip: !canQueryDetail || isClient }
  );

  const { data: authDetail } = useGetBriefAiDetailQuery(briefId ?? '', {
    skip: !isClient || !briefId,
    refetchOnMountOrArgChange: true,
  });

  const { data: sentBriefIdsData } = useGetSentBriefIdsToVendorQuery(slug, {
    skip: !isClient,
    refetchOnMountOrArgChange: true,
  });

  const conversationStatus = isClient
    ? (authDetail?.conversationStatus ?? 'in_progress')
    : (publicDetail?.conversationStatus ?? 'in_progress');

  const documentReady = conversationStatus === 'ready_to_finalize' || conversationStatus === 'finalized';
  const anonAlreadySent = !isClient && !!briefId && isBriefSent(briefId);
  const alreadySent = isClient ? !!briefId && !!(sentBriefIdsData?.briefIds ?? []).includes(briefId) : anonAlreadySent;
  const isSendEnabled = documentReady && !alreadySent;

  const handleBriefCreated = (newBriefId: string, newToken?: string) => {
    setBriefId(newBriefId);
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
    if (isClient) {
      dispatch(briefAiApi.util.invalidateTags([{ type: 'SentBriefIds', id: slug }]));
    } else if (briefId) {
      markBriefAsSent(briefId);
      clearDraftForSlug(slug);
    }
    router.push(AppRoute.BRANDED_BRIEF_SUCCESS(slug) + (isEmbed ? '?embed=1' : ''));
  };

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

  const branding = (
    <div className={styles.branding}>
      {slugInfo.vendorLogoUrl ? (
        <img src={slugInfo.vendorLogoUrl} alt={vendorName} className={styles.brandingLogo} />
      ) : (
        <Avatar size={28} icon={<UserOutlined />} />
      )}
      <span className={styles.brandingTitle}>{t('BRANDED_BRIEF_FOR', vendorName)}</span>
    </div>
  );

  const sendButton = alreadySent ? (
    <span className={styles.alreadySentLabel}>{t('BRANDED_BRIEF_ALREADY_SENT')}</span>
  ) : (
    <Button
      type='primary'
      icon={<SendOutlined />}
      disabled={!isSendEnabled}
      title={isSendEnabled ? undefined : t('BRANDED_BRIEF_SEND_DISABLED_HINT')}
      onClick={async () => {
        await (isClient ? authEditorRef.current?.flush() : anonDocPanelRef.current?.flush());
        setSendModalOpen(true);
      }}
    >
      {t('BRANDED_BRIEF_SEND')}
    </Button>
  );

  const documentPane =
    token && briefId ? (
      <WhiteLabelDocumentPanel ref={anonDocPanelRef} briefId={briefId} token={token} />
    ) : (
      <div className={styles.centerWrapper}>
        <Empty description={t('BRIEF_V3_DOCUMENT_MISSING')} />
      </div>
    );

  const chatPane = isClient ? (
    <AuthenticatedBriefEditor ref={authEditorRef} briefId={briefId ?? ''} whiteLabel={true} alreadySent={alreadySent} />
  ) : (
    <AnonymousBriefEditor
      briefId={briefId}
      token={token}
      whiteLabel={true}
      alreadySent={alreadySent}
      getLatestDocumentHtml={getLatestDocumentHtml}
      onBriefCreated={handleBriefCreated}
      onRegisterClick={handleRegisterClick}
    />
  );

  const sendModal = sendModalOpen ? (
    <SendBriefModal
      value={sendModalOpen}
      onChange={setSendModalOpen}
      briefId={briefId ?? ''}
      slug={slug}
      vendorName={vendorName}
      isAnon={!isClient}
      token={token}
      onSuccess={handleSendSuccess}
    />
  ) : null;

  // Authenticated client: AuthenticatedBriefEditor renders its own document/chat
  // split once finalized, so it takes the full width — no separate doc pane here.
  if (isClient) {
    return (
      <div className={styles.desktopWrapper}>
        <div className={styles.desktopHeader}>
          {!isEmbed ? branding : <div />}
          <div className={styles.desktopHeaderActions}>{sendButton}</div>
        </div>
        <div className={styles.desktopContent}>{chatPane}</div>
        {sendModal}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.mobileWrapper}>
        <div className={styles.mobileTabsHeader}>
          {documentReady ? (
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
          ) : (
            branding
          )}
          <div className={styles.mobileSendAction}>{sendButton}</div>
        </div>

        <div
          className={`${styles.mobileChatPane}${documentReady && mobileTab !== 'chat' ? ` ${styles.mobileHidden}` : ''}`}
        >
          {chatPane}
        </div>
        {documentReady ? (
          <div className={`${styles.mobileDocPane}${mobileTab !== 'brief' ? ` ${styles.mobileHidden}` : ''}`}>
            {documentPane}
          </div>
        ) : null}

        {sendModal}
      </div>
    );
  }

  return (
    <div className={styles.desktopWrapper}>
      <div className={styles.desktopHeader}>
        {!isEmbed ? branding : <div />}
        <div className={styles.desktopHeaderActions}>{sendButton}</div>
      </div>
      <div className={styles.desktopContent}>
        {documentReady ? <div className={styles.desktopDocPane}>{documentPane}</div> : null}
        <div className={styles.desktopChatPane}>{chatPane}</div>
      </div>

      {sendModal}
    </div>
  );
};
