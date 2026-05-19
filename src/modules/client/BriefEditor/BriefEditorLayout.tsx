'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { App, Button, Empty } from 'antd';
import Link from 'next/link';
import { AppRoute } from '@/constants/appRoute';
import { useAppDispatch } from '@/store/hooks';
import { t, getLocale } from '@/lib/i18n';
import { BriefChatPanel } from '@/modules/client/BriefChat/BriefChatPanel';
import { VoiceRecorderButton } from '@/modules/client/BriefChat/VoiceRecorderButton';
import { ComparisonTable } from '@/modules/client/ComparisonTable/ComparisonTable';
import { FileUploadZone } from './components/FileUploadZone';
import { BriefFinalPackage } from './BriefFinalPackage';
import { BriefSettings } from './BriefSettings';
import { EditableBriefTitle } from './components/EditableBriefTitle';
import {
  briefAiApi,
  useCreateBriefAiDraftMutation,
  useDeleteBriefAiAttachmentMutation,
  useFinalizeBriefAiMutation,
  useGetBriefAiDetailQuery,
  useGetBriefAiFinalDocumentsQuery,
  useLazyGetBriefAiStatusQuery,
  useSendBriefAiChatMutation,
  useSendBriefAiFeedbackMutation,
  useStartBriefAiMutation,
  useUploadBriefAiAttachmentMutation,
} from '@/services/client/briefAiApi';
import {
  useCreatePublicBriefDraftMutation,
  useDeletePublicBriefAttachmentMutation,
  useGetPublicBriefDetailQuery,
  useLazyGetPublicBriefStatusQuery,
  useSendPublicBriefChatMutation,
  useStartPublicBriefMutation,
  useUploadPublicBriefAttachmentMutation,
  savePublicBriefToken,
} from '@/services/client/publicBriefApi';
import { BriefAttachment, BriefV3Detail, ChatMessageV3, ConversationStatus } from '@/types/briefAi.interface';
import { useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import styles from './BriefEditorLayout.module.css';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 180000;

const MESSAGE_LIMIT_AUTH = 100;
const MESSAGE_LIMIT_ANON = 50;
const MAX_ATTACHMENTS_AUTH = 10;
const MAX_ATTACHMENTS_ANON = 3;

type Stage = 'start' | 'generating' | 'chat' | 'finalizing' | 'finalized' | 'comparison' | 'settings';

interface OuterWrapperProps {
  footerVisible: boolean;
  footerHeight: number;
  children: React.ReactNode;
}

const OuterWrapper = (props: OuterWrapperProps) => {
  const heightValue = props.footerVisible
    ? `calc(100dvh - var(--aivus-header-h) - ${props.footerHeight}px)`
    : 'calc(100dvh - var(--aivus-header-h))';

  return (
    <div className={styles.outerWrapper} style={{ height: heightValue }}>
      {props.children}
    </div>
  );
};

interface GeneratingViewProps {
  title: string;
  subtitle: string;
}

const GeneratingView = (props: GeneratingViewProps) => {
  return (
    <div className={styles.generatingOverlay}>
      <div className={styles.spinner} />
      <h3 className={styles.generatingTitle}>{props.title}</h3>
      <p className={styles.generatingSubtitle}>{props.subtitle}</p>
    </div>
  );
};

interface BriefEditorLayoutProps {
  mode: 'authenticated' | 'anonymous';
  briefId?: string | null;
  token?: string | null;
  initialTaskId?: string | null;
  onBriefCreated?: (briefId: string, token?: string) => void;
  onRegisterClick?: (briefId: string | null, token: string | null) => void;
}

export const BriefEditorLayout = (props: BriefEditorLayoutProps) => {
  const { message: messageApi } = App.useApp();
  const dispatch = useAppDispatch();
  const isAuth = props.mode === 'authenticated';

  const [briefId, setBriefId] = useState<string | null>(props.briefId ?? null);
  const [stage, setStage] = useState<Stage>(props.briefId ? 'chat' : 'start');
  const [hasMounted, setHasMounted] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const mobileActionsSlotRef = useRef<HTMLDivElement | null>(null);
  const { dismissed: footerDismissed } = useBetaFooter();
  const footerVisible = !footerDismissed;
  const footerHeight = useBetaFooterHeight();
  const { isMobile } = useBreakpoint();
  const [mobileTab, setMobileTab] = useState<'brief' | 'chat'>('brief');

  useEffect(() => {
    setHasMounted(true);
    setHeaderSlot(document.getElementById('brief-header-slot'));
  }, []);
  const [startText, setStartText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<BriefAttachment[]>([]);

  const [messages, setMessages] = useState<ChatMessageV3[]>([]);
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('in_progress');
  const [totalCostUsd, setTotalCostUsd] = useState<string>('0');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStartVoiceBusy, setIsStartVoiceBusy] = useState(false);
  const [showCost, setShowCost] = useState<boolean>(false);

  const [createDraftAuth] = useCreateBriefAiDraftMutation();
  const [startBriefAuth] = useStartBriefAiMutation();
  const [fetchStatusAuth] = useLazyGetBriefAiStatusQuery();
  const [sendChatAuth] = useSendBriefAiChatMutation();
  const [uploadAttachAuth] = useUploadBriefAiAttachmentMutation();
  const [deleteAttachAuth] = useDeleteBriefAiAttachmentMutation();
  const [sendFeedbackAuth] = useSendBriefAiFeedbackMutation();
  const [finalizeAuth] = useFinalizeBriefAiMutation();
  const {
    data: authDetail,
    isFetching: isAuthDetailFetching,
    error: authDetailError,
    refetch: refetchAuthDetail,
  } = useGetBriefAiDetailQuery(briefId ?? '', {
    skip: !briefId || !isAuth || stage === 'start' || stage === 'generating',
    refetchOnMountOrArgChange: true,
  });
  const { data: authFinalDocs, refetch: refetchAuthFinal } = useGetBriefAiFinalDocumentsQuery(briefId ?? '', {
    skip: !briefId || !isAuth || stage !== 'finalized',
    refetchOnMountOrArgChange: true,
  });

  const [startToken, setStartToken] = useState<string | null>(props.token ?? null);
  const token = startToken;
  const [createDraftPublic] = useCreatePublicBriefDraftMutation();
  const [startBriefPublic] = useStartPublicBriefMutation();
  const [fetchStatusPublic] = useLazyGetPublicBriefStatusQuery();
  const [sendChatPublic] = useSendPublicBriefChatMutation();
  const [uploadAttachPublic] = useUploadPublicBriefAttachmentMutation();
  const [deleteAttachPublic] = useDeletePublicBriefAttachmentMutation();
  const { data: publicDetail } = useGetPublicBriefDetailQuery(
    { briefId: briefId ?? '', token: token ?? '' },
    { skip: !briefId || !token || isAuth || stage === 'start' || stage === 'generating' }
  );

  const hydrateFromDetail = useCallback((detail: BriefV3Detail | undefined) => {
    if (!detail) {
      return;
    }
    setMessages(detail.messages ?? []);
    setConversationStatus(detail.conversationStatus);
    setTotalCostUsd(detail.totalCostUsd);
    setMessageCount(detail.messageCount);
    setShowCost(Boolean(detail.showCost));
    if (detail.conversationStatus === 'finalized') {
      setStage((prev) => (prev === 'finalized' ? prev : 'finalized'));
    }
  }, []);

  useEffect(() => {
    if (isAuth) {
      hydrateFromDetail(authDetail);
    } else {
      hydrateFromDetail(publicDetail);
    }
  }, [authDetail, publicDetail, isAuth, hydrateFromDetail]);

  const handleSelectMobileTab = (tab: 'brief' | 'chat') => {
    setMobileTab(tab);
  };

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const pollFirstReply = useCallback(
    (currentBriefId: string, taskId: string, currentToken?: string) => {
      const started = Date.now();
      clearPolling();
      const session = { cancelled: false };
      const stop = () => {
        session.cancelled = true;
        clearPolling();
      };

      pollingRef.current = setInterval(async () => {
        if (session.cancelled) {
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          stop();
          messageApi.error(t('BRIEF_V3_GENERATION_TIMEOUT'));
          setStage('chat');
          return;
        }

        try {
          const response = isAuth
            ? await fetchStatusAuth({ briefId: currentBriefId, taskId }).unwrap()
            : await fetchStatusPublic({
                briefId: currentBriefId,
                taskId,
                token: currentToken ?? '',
              }).unwrap();

          if (session.cancelled) {
            return;
          }
          if (response.status === 'done' && response.result) {
            stop();
            hydrateFromDetail(response.result);
            setStage('chat');
          } else if (response.status === 'failed') {
            stop();
            messageApi.error(t('BRIEF_V3_GENERATION_FAILED'));
            setStage('start');
          }
        } catch {
          if (session.cancelled) {
            return;
          }
          stop();
          messageApi.error(t('BRIEF_V3_GENERATION_FAILED'));
          setStage('start');
        }
      }, POLL_INTERVAL_MS);
    },
    [fetchStatusAuth, fetchStatusPublic, hydrateFromDetail, isAuth, messageApi]
  );

  useEffect(() => {
    return () => clearPolling();
  }, []);

  useEffect(() => {
    if (props.briefId && props.initialTaskId && !pollingRef.current) {
      setStage('generating');
      pollFirstReply(props.briefId, props.initialTaskId, props.token ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.briefId, props.initialTaskId]);

  const pollFinalDocuments = useCallback(
    (currentBriefId: string, taskId: string, currentToken?: string) => {
      const started = Date.now();
      clearPolling();
      const session = { cancelled: false };
      const stop = () => {
        session.cancelled = true;
        clearPolling();
      };

      pollingRef.current = setInterval(async () => {
        if (session.cancelled) {
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          stop();
          messageApi.error(t('BRIEF_V3_FINALIZE_TIMEOUT'));
          setStage('chat');
          return;
        }

        try {
          const response = isAuth
            ? await fetchStatusAuth({ briefId: currentBriefId, taskId }).unwrap()
            : await fetchStatusPublic({
                briefId: currentBriefId,
                taskId,
                token: currentToken ?? '',
              }).unwrap();

          if (session.cancelled) {
            return;
          }
          if (response.status === 'done' && response.result) {
            stop();
            const finalDetail = response.result;
            hydrateFromDetail(finalDetail);
            setConversationStatus('finalized');
            setStage('finalized');
            if (isAuth && briefId) {
              dispatch(
                briefAiApi.util.updateQueryData('getBriefAiDetail', briefId, (draft) => {
                  Object.assign(draft, finalDetail);
                })
              );
              refetchAuthFinal();
              refetchAuthDetail();
            }
          } else if (response.status === 'failed') {
            stop();
            messageApi.error(t('BRIEF_V3_FINALIZE_FAILED'));
            setStage('chat');
          }
        } catch {
          if (session.cancelled) {
            return;
          }
          stop();
          messageApi.error(t('BRIEF_V3_FINALIZE_FAILED'));
          setStage('chat');
        }
      }, POLL_INTERVAL_MS);
    },
    [
      briefId,
      dispatch,
      fetchStatusAuth,
      fetchStatusPublic,
      hydrateFromDetail,
      isAuth,
      messageApi,
      refetchAuthDetail,
      refetchAuthFinal,
    ]
  );

  const ensureDraft = useCallback(async (): Promise<{
    briefId: string;
    token: string | null;
  } | null> => {
    if (briefId) {
      return { briefId, token };
    }
    try {
      if (isAuth) {
        const response = await createDraftAuth().unwrap();
        setBriefId(response.briefId);
        props.onBriefCreated?.(response.briefId);
        return { briefId: response.briefId, token: null };
      }
      const response = await createDraftPublic().unwrap();
      setBriefId(response.briefId);
      setStartToken(response.token);
      savePublicBriefToken(response.briefId, response.token);
      props.onBriefCreated?.(response.briefId, response.token);
      return { briefId: response.briefId, token: response.token };
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
      return null;
    }
  }, [briefId, createDraftAuth, createDraftPublic, isAuth, messageApi, props, token]);

  const handleUploadAttachment = useCallback(
    async (file: File) => {
      const draft = await ensureDraft();
      if (!draft) {
        return;
      }

      setUploading(true);
      try {
        const attachment = isAuth
          ? await uploadAttachAuth({ briefId: draft.briefId, file }).unwrap()
          : await uploadAttachPublic({
              briefId: draft.briefId,
              token: draft.token ?? '',
              file,
            }).unwrap();
        setPendingAttachments((prev) => [...prev, attachment]);
      } catch {
        messageApi.error(t('BRIEF_V3_ATTACH_UPLOAD_FAILED'));
      } finally {
        setUploading(false);
      }
    },
    [ensureDraft, isAuth, messageApi, uploadAttachAuth, uploadAttachPublic]
  );

  const handleDeleteAttachment = useCallback(
    async (attachmentId: string) => {
      if (!briefId) {
        return;
      }
      try {
        if (isAuth) {
          await deleteAttachAuth({ briefId, attachmentId }).unwrap();
        } else {
          await deleteAttachPublic({
            briefId,
            attachmentId,
            token: token ?? '',
          }).unwrap();
        }
        setPendingAttachments((prev) => prev.filter((x) => x.id !== attachmentId));
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
    },
    [briefId, deleteAttachAuth, deleteAttachPublic, isAuth, messageApi, token]
  );

  const handleStart = useCallback(async () => {
    const trimmed = startText.trim();
    if (!trimmed || isStarting) {
      return;
    }

    setIsStarting(true);
    try {
      const draft = await ensureDraft();
      if (!draft) {
        return;
      }

      const attachmentIds = pendingAttachments.map((x) => x.id);
      const documentLanguage = getLocale();
      if (isAuth) {
        const response = await startBriefAuth({
          briefId: draft.briefId,
          message: trimmed,
          attachmentIds,
          documentLanguage,
        }).unwrap();
        setStage('generating');
        pollFirstReply(draft.briefId, response.taskId);
      } else {
        const response = await startBriefPublic({
          briefId: draft.briefId,
          token: draft.token ?? '',
          message: trimmed,
          attachmentIds,
          documentLanguage,
        }).unwrap();
        setStage('generating');
        pollFirstReply(draft.briefId, response.taskId, draft.token ?? '');
      }

      setMessages([
        {
          id: 'local-' + Date.now(),
          role: 'user',
          content: trimmed,
          readyToFinalize: false,
          modelUsed: '',
          inputTokens: 0,
          outputTokens: 0,
          costUsd: '0',
          attachments: pendingAttachments,
          feedback: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setPendingAttachments([]);
      setStartText('');
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    } finally {
      setIsStarting(false);
    }
  }, [
    ensureDraft,
    isAuth,
    isStarting,
    messageApi,
    pendingAttachments,
    pollFirstReply,
    startBriefAuth,
    startBriefPublic,
    startText,
  ]);

  const handleSendMessage = useCallback(
    async (text: string, attachmentIds: string[]) => {
      if (!briefId || isChatLoading) {
        return;
      }
      setIsChatLoading(true);

      const localUserMessage: ChatMessageV3 = {
        id: 'local-' + Date.now(),
        role: 'user',
        content: text,
        readyToFinalize: false,
        modelUsed: '',
        inputTokens: 0,
        outputTokens: 0,
        costUsd: '0',
        attachments: pendingAttachments.filter((x) => attachmentIds.includes(x.id)),
        feedback: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, localUserMessage]);
      setPendingAttachments((prev) => prev.filter((x) => !attachmentIds.includes(x.id)));

      try {
        const response = isAuth
          ? await sendChatAuth({
              briefId,
              message: text,
              attachmentIds,
            }).unwrap()
          : await sendChatPublic({
              briefId,
              message: text,
              attachmentIds,
              token: token ?? '',
            }).unwrap();

        setMessages((prev) => [
          ...prev,
          {
            id: response.messageId,
            role: 'assistant',
            content: response.reply,
            readyToFinalize: response.readyToFinalize,
            modelUsed: '',
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
            costUsd: response.costUsd,
            attachments: [],
            feedback: null,
            createdAt: new Date().toISOString(),
          },
        ]);
        setConversationStatus(response.conversationStatus);
        setMessageCount(response.messageCount);
        const prevCost = Number(totalCostUsd) || 0;
        const addCost = Number(response.costUsd) || 0;
        setTotalCostUsd(String(prevCost + addCost));
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
      } finally {
        setIsChatLoading(false);
      }
    },
    [briefId, isAuth, isChatLoading, messageApi, pendingAttachments, sendChatAuth, sendChatPublic, token, totalCostUsd]
  );

  const handleFeedback = useCallback(
    async (messageId: string, rating: 'up' | 'down') => {
      if (!briefId || !isAuth) {
        return;
      }
      try {
        await sendFeedbackAuth({
          briefId,
          messageId,
          rating,
          comment: '',
        }).unwrap();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  feedback: {
                    id: 'local-' + Date.now(),
                    messageId,
                    rating,
                    comment: '',
                    userId: null,
                    createdAt: new Date().toISOString(),
                  },
                }
              : msg
          )
        );
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
    },
    [briefId, isAuth, messageApi, sendFeedbackAuth]
  );

  const handleFeedbackComment = useCallback(
    async (messageId: string, rating: 'up' | 'down', comment: string) => {
      if (!briefId || !isAuth) {
        return;
      }
      try {
        await sendFeedbackAuth({
          briefId,
          messageId,
          rating,
          comment,
        }).unwrap();
        messageApi.success(t('BRIEF_V3_FEEDBACK_SENT'));
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
    },
    [briefId, isAuth, messageApi, sendFeedbackAuth]
  );

  const handleFinalize = useCallback(async () => {
    if (!briefId || !isAuth) {
      return;
    }
    try {
      const response = await finalizeAuth({ briefId }).unwrap();
      setStage('finalizing');
      pollFinalDocuments(briefId, response.taskId);
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  }, [briefId, finalizeAuth, isAuth, messageApi, pollFinalDocuments]);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const handleRegenerate = useCallback(async () => {
    if (!briefId || !isAuth || isRegenerating) {
      return;
    }
    setIsRegenerating(true);
    try {
      const response = await finalizeAuth({ briefId }).unwrap();
      const started = Date.now();
      const session = { cancelled: false };
      clearPolling();
      pollingRef.current = setInterval(async () => {
        if (session.cancelled) {
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          session.cancelled = true;
          clearPolling();
          messageApi.error(t('BRIEF_V3_REGENERATE_FAILED'));
          setIsRegenerating(false);
          return;
        }
        try {
          const status = await fetchStatusAuth({ briefId, taskId: response.taskId }).unwrap();
          if (session.cancelled) {
            return;
          }
          if (status.status === 'done') {
            session.cancelled = true;
            clearPolling();
            if (status.result) {
              hydrateFromDetail(status.result);
            }
            setStage('finalized');
            setIsRegenerating(false);
            refetchAuthFinal();
            refetchAuthDetail();
          } else if (status.status === 'failed') {
            session.cancelled = true;
            clearPolling();
            messageApi.error(t('BRIEF_V3_REGENERATE_FAILED'));
            setIsRegenerating(false);
          }
        } catch {
          if (session.cancelled) {
            return;
          }
          session.cancelled = true;
          clearPolling();
          messageApi.error(t('BRIEF_V3_REGENERATE_FAILED'));
          setIsRegenerating(false);
        }
      }, POLL_INTERVAL_MS);
    } catch {
      messageApi.error(t('BRIEF_V3_REGENERATE_FAILED'));
      setIsRegenerating(false);
    }
  }, [
    briefId,
    fetchStatusAuth,
    finalizeAuth,
    hydrateFromDetail,
    isAuth,
    isRegenerating,
    messageApi,
    refetchAuthDetail,
    refetchAuthFinal,
  ]);

  const handleClaim = useCallback(() => {
    props.onRegisterClick?.(briefId, token);
  }, [briefId, props, token]);

  const finalPackage = isAuth ? authFinalDocs : null;
  const messageLimit = isAuth ? MESSAGE_LIMIT_AUTH : MESSAGE_LIMIT_ANON;
  const maxAttachments = isAuth ? MAX_ATTACHMENTS_AUTH : MAX_ATTACHMENTS_ANON;

  if (stage === 'start') {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        <div className={styles.startScreen}>
          <div className={styles.startCard}>
            <h2 className={styles.startTitle}>{t('BRIEF_V3_START_TITLE')}</h2>
            <p className={styles.startSubtitle}>{t('BRIEF_V3_START_SUBTITLE')}</p>
            <textarea
              className={styles.startTextarea}
              value={startText}
              onChange={(event) => setStartText(event.target.value)}
              placeholder={t('BRIEF_V3_START_PLACEHOLDER')}
            />
            <FileUploadZone
              attachments={pendingAttachments}
              uploading={uploading}
              maxFiles={maxAttachments}
              onUpload={handleUploadAttachment}
              onDelete={handleDeleteAttachment}
            />
            <div className={styles.startActions}>
              <div className={styles.startVoiceGroup}>
                <VoiceRecorderButton
                  briefId={briefId}
                  isPublic={!isAuth}
                  publicToken={token ?? null}
                  disabled={isStarting || uploading}
                  onTranscript={(text) =>
                    setStartText((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${text}` : text))
                  }
                  onEnsureBrief={ensureDraft}
                  onBusyChange={setIsStartVoiceBusy}
                  compact
                />
                {!isStartVoiceBusy ? (
                  <span className={styles.startVoiceHint}>{t('BRIEF_V3_VOICE_START_HINT')}</span>
                ) : null}
              </div>
              <Button
                type='primary'
                size='large'
                loading={isStarting}
                disabled={!startText.trim() || uploading || isStartVoiceBusy}
                onClick={handleStart}
              >
                {t('BRIEF_V3_START_BUTTON')}
              </Button>
            </div>
          </div>
        </div>
      </OuterWrapper>
    );
  }

  if (stage === 'generating' || stage === 'finalizing') {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        <GeneratingView
          title={stage === 'generating' ? t('BRIEF_V3_GENERATING_TITLE') : t('BRIEF_V3_FINALIZING_TITLE')}
          subtitle={stage === 'generating' ? t('BRIEF_V3_GENERATING_SUBTITLE') : t('BRIEF_V3_FINALIZING_SUBTITLE')}
        />
      </OuterWrapper>
    );
  }

  const authDetailNotFound =
    isAuth &&
    !!briefId &&
    !!authDetailError &&
    typeof authDetailError === 'object' &&
    'status' in authDetailError &&
    (authDetailError as { status?: number }).status === 404;

  if (authDetailNotFound) {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        <div className={styles.notFoundWrapper}>
          <Empty description={t('BRIEF_NOT_FOUND')}>
            <Link href={AppRoute.DASHBOARD}>
              <Button type='primary'>{t('GO_TO_DASHBOARD')}</Button>
            </Link>
          </Empty>
        </div>
      </OuterWrapper>
    );
  }

  const showInlineTitle = isMobile && isAuth && !!briefId;
  const pageTitleHeader =
    !isMobile && isAuth && briefId && headerSlot
      ? createPortal(
          <EditableBriefTitle briefId={briefId} title={authDetail?.title ?? ''} editable variant='portal' />,
          headerSlot
        )
      : null;
  const inlineTitleBar = showInlineTitle ? (
    <div className={styles.mobileTitleBar}>
      <EditableBriefTitle briefId={briefId!} title={authDetail?.title ?? ''} editable variant='inline' />
    </div>
  ) : null;

  if (stage === 'comparison' && briefId) {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        {pageTitleHeader}
        {inlineTitleBar}
        <ComparisonTable briefId={briefId} />
      </OuterWrapper>
    );
  }

  if (stage === 'settings' && briefId && authDetail) {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        {pageTitleHeader}
        {inlineTitleBar}
        <BriefSettings brief={authDetail} />
      </OuterWrapper>
    );
  }

  const docsColumnClass =
    mobileTab === 'brief' ? `${styles.finalDocsColumn} ${styles.finalDocsColumnMobileActive}` : styles.finalDocsColumn;
  const chatColumnClass =
    mobileTab === 'chat' ? `${styles.finalChatColumn} ${styles.finalChatColumnMobileActive}` : styles.finalChatColumn;
  const mobileTabBriefClass =
    mobileTab === 'brief' ? `${styles.mobileTabButton} ${styles.mobileTabButtonActive}` : styles.mobileTabButton;
  const mobileTabChatClass =
    mobileTab === 'chat' ? `${styles.mobileTabButton} ${styles.mobileTabButtonActive}` : styles.mobileTabButton;

  if (stage === 'finalized') {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        {pageTitleHeader}
        {finalPackage ? (
          <div className={styles.finalContainer}>
            {inlineTitleBar}
            <div ref={mobileActionsSlotRef} className={styles.mobileActions} />
            <div className={styles.mobileTabBar} role='tablist'>
              <button
                type='button'
                role='tab'
                aria-selected={mobileTab === 'brief'}
                className={mobileTabBriefClass}
                onClick={() => handleSelectMobileTab('brief')}
              >
                {t('BRIEF_TAB_BRIEF')}
              </button>
              <button
                type='button'
                role='tab'
                aria-selected={mobileTab === 'chat'}
                className={mobileTabChatClass}
                onClick={() => handleSelectMobileTab('chat')}
              >
                {t('BRIEF_TAB_CHAT')}
              </button>
            </div>
            <div className={styles.finalSplit}>
              <div className={docsColumnClass}>
                <BriefFinalPackage
                  briefId={briefId!}
                  package={finalPackage}
                  onRegenerate={isAuth ? handleRegenerate : null}
                  isRegenerating={isRegenerating}
                  mobileActionsSlot={mobileActionsSlotRef.current}
                />
              </div>
              <div className={chatColumnClass}>
                <BriefChatPanel
                  briefId={briefId ?? undefined}
                  isPublic={!isAuth}
                  publicToken={token ?? null}
                  messages={messages}
                  conversationStatus={conversationStatus}
                  isLoading={isChatLoading}
                  messageLimit={messageLimit}
                  messageCount={messageCount}
                  totalCostUsd={totalCostUsd}
                  showCost={showCost}
                  pendingAttachments={pendingAttachments}
                  uploading={uploading}
                  maxAttachments={maxAttachments}
                  onUploadAttachment={handleUploadAttachment}
                  onDeleteAttachment={handleDeleteAttachment}
                  onSendMessage={handleSendMessage}
                  onFeedback={isAuth ? handleFeedback : null}
                  onFeedbackComment={isAuth ? handleFeedbackComment : null}
                  onFinalize={null}
                  onRegenerate={null}
                  isRegenerating={isRegenerating}
                  onShowPackage={null}
                  showRegistrationButton={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <GeneratingView title={t('BRIEF_V3_LOADING_DOCS_TITLE')} subtitle={t('BRIEF_V3_LOADING_DOCS_SUBTITLE')} />
        )}
      </OuterWrapper>
    );
  }

  const showRegistrationButton =
    !isAuth && (conversationStatus === 'ready_to_finalize' || conversationStatus === 'finalized');

  const isHydrating =
    hasMounted &&
    stage === 'chat' &&
    briefId &&
    ((isAuth && !authDetail && isAuthDetailFetching) || (!isAuth && token && !publicDetail));
  if (isHydrating) {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        <GeneratingView title={t('BRIEF_V3_LOADING_BRIEF_TITLE')} subtitle={t('BRIEF_V3_LOADING_BRIEF_SUBTITLE')} />
      </OuterWrapper>
    );
  }

  return (
    <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
      {pageTitleHeader}
      {inlineTitleBar}
      <div className={styles.chatScreen}>
        <div className={styles.chatWrapper}>
          <BriefChatPanel
            briefId={briefId ?? undefined}
            isPublic={!isAuth}
            publicToken={token ?? null}
            messages={messages}
            conversationStatus={conversationStatus}
            isLoading={isChatLoading}
            messageLimit={messageLimit}
            messageCount={messageCount}
            totalCostUsd={totalCostUsd}
            showCost={showCost}
            pendingAttachments={pendingAttachments}
            uploading={uploading}
            maxAttachments={maxAttachments}
            onUploadAttachment={handleUploadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
            onSendMessage={handleSendMessage}
            onFeedback={isAuth ? handleFeedback : null}
            onFeedbackComment={isAuth ? handleFeedbackComment : null}
            onFinalize={isAuth ? handleFinalize : null}
            onRegenerate={isAuth && conversationStatus === 'finalized' ? handleRegenerate : null}
            isRegenerating={isRegenerating}
            onShowPackage={isAuth && conversationStatus === 'finalized' ? () => setStage('finalized') : null}
            showRegistrationButton={showRegistrationButton}
            onRegisterClick={!isAuth ? handleClaim : undefined}
          />
        </div>
      </div>
    </OuterWrapper>
  );
};
