'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { App, Button, Empty } from 'antd';
import Link from 'next/link';
import { AppRoute } from '@/constants/appRoute';
import { useAppDispatch } from '@/store/hooks';
import { t, getLocale } from '@/lib/i18n';
import { BriefChatPanel } from '@/modules/client/BriefChat/BriefChatPanel';
import {
  briefAiApi,
  useCreateBriefAiDraftMutation,
  useDeleteBriefAiAttachmentMutation,
  useFinalizeBriefAiMutation,
  useGetBriefAiDetailQuery,
  useGetBriefAiFinalDocumentsQuery,
  useSendBriefAiChatMutation,
  useSendBriefAiFeedbackMutation,
  useStartBriefAiMutation,
  useUploadBriefAiAttachmentMutation,
} from '@/services/client/briefAiApi';
import { BriefAttachment, BriefV3Detail } from '@/types/briefAi.interface';
import { useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { OuterWrapper } from './components/OuterWrapper';
import { GeneratingView } from './components/GeneratingView';
import { FinalizingView } from './components/FinalizingView';
import { BriefStartScreen } from './components/BriefStartScreen';
import { EditableBriefTitle } from './components/EditableBriefTitle';
import { useBriefPolling } from './hooks/useBriefPolling';
import { deriveStage, lastMessageIsAssistant } from './lib/deriveStage';
import { makeLocalUserMessage } from './lib/makeLocalUserMessage';
import { MAX_ATTACHMENTS_AUTH, MESSAGE_LIMIT_AUTH } from './constants';
import { BriefFinalPackage, BriefFinalPackageHandle } from './BriefFinalPackage';

import styles from './BriefEditor.module.css';

export interface AuthenticatedBriefEditorHandle {
  flush: () => Promise<void>;
}

interface AuthenticatedBriefEditorProps {
  briefId?: string | null;
  onBriefCreated?: (briefId: string) => void;
  whiteLabel?: boolean;
}

const isFinalizeContext = (detail: BriefV3Detail | undefined): boolean => {
  const status = detail?.conversationStatus;
  return status === 'ready_to_finalize' || status === 'finalized';
};

export const AuthenticatedBriefEditor = forwardRef<AuthenticatedBriefEditorHandle, AuthenticatedBriefEditorProps>(
  (props, ref) => {
    const { message: messageApi } = App.useApp();
    const dispatch = useAppDispatch();

    const [briefId, setBriefId] = useState<string | null>(props.briefId ?? null);
    const [localTaskId, setLocalTaskId] = useState<string | null>(null);
    const [startText, setStartText] = useState('');
    const [pendingAttachments, setPendingAttachments] = useState<BriefAttachment[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isStartVoiceBusy, setIsStartVoiceBusy] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [mobileTab, setMobileTab] = useState<'brief' | 'chat'>('brief');
    const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
    const [mobileActionsSlot, setMobileActionsSlot] = useState<HTMLDivElement | null>(null);
    const autoFinalizingRef = useRef(false);
    const finalPackageRef = useRef<BriefFinalPackageHandle | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        flush: () => finalPackageRef.current?.flush() ?? Promise.resolve(),
      }),
      []
    );

    const { dismissed: footerDismissed } = useBetaFooter();
    const footerVisible = !footerDismissed;
    const footerHeight = useBetaFooterHeight();
    const { isMobile } = useBreakpoint();

    const [createDraft] = useCreateBriefAiDraftMutation();
    const [startBrief] = useStartBriefAiMutation();
    const [sendChat] = useSendBriefAiChatMutation();
    const [uploadAttach] = useUploadBriefAiAttachmentMutation();
    const [deleteAttach] = useDeleteBriefAiAttachmentMutation();
    const [sendFeedback] = useSendBriefAiFeedbackMutation();
    const [finalize] = useFinalizeBriefAiMutation();

    useEffect(() => {
      setHeaderSlot(document.getElementById('brief-header-slot'));
    }, []);

    const { data: detail, error: detailError } = useGetBriefAiDetailQuery(briefId ?? '', {
      skip: !briefId,
      refetchOnMountOrArgChange: true,
    });

    const pendingTaskId = detail?.pendingTaskId || localTaskId || null;
    const stage = deriveStage({
      hasBrief: !!briefId,
      openedExisting: !!props.briefId,
      detail,
      isStarting,
      pendingTaskId,
    });

    const messages = detail?.messages ?? [];
    const conversationStatus = detail?.conversationStatus ?? 'in_progress';
    const messageCount = detail?.messageCount ?? 0;
    const totalCostUsd = detail?.totalCostUsd ?? '0';
    const showCost = !!detail?.showCost;

    const { data: finalPackage } = useGetBriefAiFinalDocumentsQuery(briefId ?? '', {
      skip: !briefId || stage !== 'finalized',
      refetchOnMountOrArgChange: true,
    });

    const handleDone = useCallback(
      (result: BriefV3Detail) => {
        setLocalTaskId(null);
        setIsRegenerating(false);
        if (briefId) {
          dispatch(
            briefAiApi.util.updateQueryData('getBriefAiDetail', briefId, (draft) => {
              Object.assign(draft, result);
            })
          );
          if (result.conversationStatus === 'finalized') {
            dispatch(briefAiApi.util.invalidateTags([{ type: 'BriefFinalDocuments', id: briefId }, 'BriefV3']));
          }
        }
        if (result.conversationStatus !== 'finalized' && !lastMessageIsAssistant(result)) {
          messageApi.error(t('BRIEF_V3_GENERATION_FAILED'));
        }
      },
      [briefId, dispatch, messageApi]
    );

    const handleFailed = useCallback(() => {
      setLocalTaskId(null);
      setIsRegenerating(false);
      messageApi.error(isFinalizeContext(detail) ? t('BRIEF_V3_FINALIZE_FAILED') : t('BRIEF_V3_GENERATION_FAILED'));
    }, [detail, messageApi]);

    const handleTimeout = useCallback(() => {
      setLocalTaskId(null);
      setIsRegenerating(false);
      messageApi.error(isFinalizeContext(detail) ? t('BRIEF_V3_FINALIZE_TIMEOUT') : t('BRIEF_V3_GENERATION_TIMEOUT'));
    }, [detail, messageApi]);

    useBriefPolling({
      enabled: !!pendingTaskId && !!briefId,
      briefId,
      isAuth: true,
      token: null,
      taskId: pendingTaskId,
      onDone: handleDone,
      onFailed: handleFailed,
      onTimeout: handleTimeout,
    });

    const ensureDraft = useCallback(async (): Promise<{ briefId: string; token: string | null } | null> => {
      if (briefId) {
        return { briefId, token: null };
      }
      try {
        const response = await createDraft().unwrap();
        setBriefId(response.briefId);
        props.onBriefCreated?.(response.briefId);
        return { briefId: response.briefId, token: null };
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
        return null;
      }
    }, [briefId, createDraft, messageApi, props]);

    const handleUploadAttachment = useCallback(
      async (file: File) => {
        const draft = await ensureDraft();
        if (!draft) {
          return;
        }
        setUploading(true);
        try {
          const attachment = await uploadAttach({ briefId: draft.briefId, file }).unwrap();
          setPendingAttachments((prev) => [...prev, attachment]);
        } catch {
          messageApi.error(t('BRIEF_V3_ATTACH_UPLOAD_FAILED'));
        } finally {
          setUploading(false);
        }
      },
      [ensureDraft, messageApi, uploadAttach]
    );

    const handleDeleteAttachment = useCallback(
      async (attachmentId: string) => {
        if (!briefId) {
          return;
        }
        try {
          await deleteAttach({ briefId, attachmentId }).unwrap();
          setPendingAttachments((prev) => prev.filter((x) => x.id !== attachmentId));
        } catch {
          messageApi.error(t('UNEXPECTED_ERROR'));
        }
      },
      [briefId, deleteAttach, messageApi]
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
        const response = await startBrief({
          briefId: draft.briefId,
          message: trimmed,
          attachmentIds: pendingAttachments.map((x) => x.id),
          documentLanguage: getLocale(),
        }).unwrap();
        setLocalTaskId(response.taskId);
        setPendingAttachments([]);
        setStartText('');
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
      } finally {
        setIsStarting(false);
      }
    }, [ensureDraft, isStarting, messageApi, pendingAttachments, startBrief, startText]);

    const handleSendMessage = useCallback(
      async (text: string, attachmentIds: string[]) => {
        if (!briefId || isChatLoading || pendingTaskId) {
          return;
        }
        setIsChatLoading(true);
        const localMessage = makeLocalUserMessage(
          text,
          pendingAttachments.filter((x) => attachmentIds.includes(x.id))
        );
        const patch = dispatch(
          briefAiApi.util.updateQueryData('getBriefAiDetail', briefId, (draft) => {
            draft.messages.push(localMessage);
          })
        );
        setPendingAttachments((prev) => prev.filter((x) => !attachmentIds.includes(x.id)));
        try {
          await sendChat({ briefId, message: text, attachmentIds }).unwrap();
        } catch {
          patch.undo();
          messageApi.error(t('UNEXPECTED_ERROR'));
        } finally {
          setIsChatLoading(false);
        }
      },
      [briefId, dispatch, isChatLoading, messageApi, pendingAttachments, pendingTaskId, sendChat]
    );

    const handleFinalize = useCallback(async () => {
      if (!briefId) {
        return;
      }
      try {
        const response = await finalize({ briefId }).unwrap();
        setLocalTaskId(response.taskId);
      } catch {
        autoFinalizingRef.current = false;
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
    }, [briefId, finalize, messageApi]);

    useEffect(() => {
      if (!briefId || pendingTaskId || conversationStatus !== 'ready_to_finalize' || autoFinalizingRef.current) {
        return;
      }
      autoFinalizingRef.current = true;
      void handleFinalize();
    }, [briefId, conversationStatus, pendingTaskId, handleFinalize]);

    const handleRegenerate = useCallback(async () => {
      if (!briefId || isRegenerating || pendingTaskId) {
        return;
      }
      setIsRegenerating(true);
      try {
        const response = await finalize({ briefId }).unwrap();
        setLocalTaskId(response.taskId);
      } catch {
        setIsRegenerating(false);
        messageApi.error(t('BRIEF_V3_REGENERATE_FAILED'));
      }
    }, [briefId, finalize, isRegenerating, messageApi, pendingTaskId]);

    const handleFeedback = useCallback(
      async (messageId: string, rating: 'up' | 'down') => {
        if (!briefId) {
          return;
        }
        try {
          await sendFeedback({ briefId, messageId, rating, comment: '' }).unwrap();
          dispatch(
            briefAiApi.util.updateQueryData('getBriefAiDetail', briefId, (draft) => {
              const target = draft.messages.find((x) => x.id === messageId);
              if (target) {
                target.feedback = {
                  id: 'local-' + Date.now(),
                  messageId,
                  rating,
                  comment: '',
                  userId: null,
                  createdAt: new Date().toISOString(),
                };
              }
            })
          );
        } catch {
          messageApi.error(t('UNEXPECTED_ERROR'));
        }
      },
      [briefId, dispatch, messageApi, sendFeedback]
    );

    const handleFeedbackComment = useCallback(
      async (messageId: string, rating: 'up' | 'down', comment: string) => {
        if (!briefId) {
          return;
        }
        try {
          await sendFeedback({ briefId, messageId, rating, comment }).unwrap();
          messageApi.success(t('BRIEF_V3_FEEDBACK_SENT'));
        } catch {
          messageApi.error(t('UNEXPECTED_ERROR'));
        }
      },
      [briefId, messageApi, sendFeedback]
    );

    if (stage === 'start') {
      return (
        <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
          <BriefStartScreen
            startText={startText}
            onStartTextChange={setStartText}
            pendingAttachments={pendingAttachments}
            uploading={uploading}
            maxAttachments={MAX_ATTACHMENTS_AUTH}
            onUploadAttachment={handleUploadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
            briefId={briefId}
            isPublic={false}
            token={null}
            isStarting={isStarting}
            isStartVoiceBusy={isStartVoiceBusy}
            onStartVoiceBusyChange={setIsStartVoiceBusy}
            onEnsureBrief={ensureDraft}
            onStart={handleStart}
          />
        </OuterWrapper>
      );
    }

    if (stage === 'generating') {
      return (
        <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
          <GeneratingView title={t('BRIEF_V3_GENERATING_TITLE')} subtitle={t('BRIEF_V3_GENERATING_SUBTITLE')} />
        </OuterWrapper>
      );
    }

    if (stage === 'finalizing') {
      return (
        <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
          <FinalizingView />
        </OuterWrapper>
      );
    }

    const detailNotFound =
      !!briefId &&
      !!detailError &&
      typeof detailError === 'object' &&
      'status' in detailError &&
      (detailError as { status?: number }).status === 404;

    if (detailNotFound) {
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

    const isHydrating = stage === 'chat' && !!briefId && !detail;
    if (isHydrating) {
      return (
        <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
          <GeneratingView title={t('BRIEF_V3_LOADING_BRIEF_TITLE')} subtitle={t('BRIEF_V3_LOADING_BRIEF_SUBTITLE')} />
        </OuterWrapper>
      );
    }

    const pageTitleHeader =
      !isMobile && briefId && headerSlot
        ? createPortal(
            <EditableBriefTitle briefId={briefId} title={detail?.title ?? ''} editable variant='portal' />,
            headerSlot
          )
        : null;
    const inlineTitleBar =
      isMobile && briefId ? (
        <div className={styles.mobileTitleBar}>
          <EditableBriefTitle briefId={briefId} title={detail?.title ?? ''} editable variant='inline' />
        </div>
      ) : null;

    const composerLocked = !!pendingTaskId;

    if (stage === 'finalized') {
      const docsColumnClass =
        mobileTab === 'brief'
          ? `${styles.finalDocsColumn} ${styles.finalDocsColumnMobileActive}`
          : styles.finalDocsColumn;
      const chatColumnClass =
        mobileTab === 'chat'
          ? `${styles.finalChatColumn} ${styles.finalChatColumnMobileActive}`
          : styles.finalChatColumn;
      const mobileTabBriefClass =
        mobileTab === 'brief' ? `${styles.mobileTabButton} ${styles.mobileTabButtonActive}` : styles.mobileTabButton;
      const mobileTabChatClass =
        mobileTab === 'chat' ? `${styles.mobileTabButton} ${styles.mobileTabButtonActive}` : styles.mobileTabButton;

      return (
        <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
          {pageTitleHeader}
          {finalPackage ? (
            <div className={styles.finalContainer}>
              {inlineTitleBar}
              <div ref={setMobileActionsSlot} className={styles.mobileActions} />
              <div className={styles.mobileTabBar} role='tablist'>
                <button
                  type='button'
                  role='tab'
                  aria-selected={mobileTab === 'brief'}
                  className={mobileTabBriefClass}
                  onClick={() => setMobileTab('brief')}
                >
                  {t('BRIEF_TAB_BRIEF')}
                </button>
                <button
                  type='button'
                  role='tab'
                  aria-selected={mobileTab === 'chat'}
                  className={mobileTabChatClass}
                  onClick={() => setMobileTab('chat')}
                >
                  {t('BRIEF_TAB_CHAT')}
                </button>
              </div>
              <div className={styles.finalSplit}>
                <div className={docsColumnClass}>
                  <BriefFinalPackage
                    ref={finalPackageRef}
                    briefId={briefId!}
                    package={finalPackage}
                    onRegenerate={handleRegenerate}
                    isRegenerating={isRegenerating}
                    mobileActionsSlot={mobileActionsSlot}
                    whiteLabel={props.whiteLabel}
                  />
                </div>
                <div className={chatColumnClass}>
                  <BriefChatPanel
                    briefId={briefId ?? undefined}
                    isPublic={false}
                    publicToken={null}
                    messages={messages}
                    conversationStatus={conversationStatus}
                    isLoading={isChatLoading}
                    messageLimit={MESSAGE_LIMIT_AUTH}
                    messageCount={messageCount}
                    totalCostUsd={totalCostUsd}
                    showCost={showCost}
                    pendingAttachments={pendingAttachments}
                    uploading={uploading}
                    maxAttachments={MAX_ATTACHMENTS_AUTH}
                    onUploadAttachment={handleUploadAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                    onSendMessage={handleSendMessage}
                    onFeedback={handleFeedback}
                    onFeedbackComment={handleFeedbackComment}
                    onRegenerate={null}
                    isRegenerating={isRegenerating}
                    onShowPackage={null}
                    showRegistrationButton={false}
                    composerDisabled={composerLocked}
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

    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight}>
        {pageTitleHeader}
        {inlineTitleBar}
        <div className={styles.chatScreen}>
          <div className={styles.chatWrapper}>
            <BriefChatPanel
              briefId={briefId ?? undefined}
              isPublic={false}
              publicToken={null}
              messages={messages}
              conversationStatus={conversationStatus}
              isLoading={isChatLoading}
              messageLimit={MESSAGE_LIMIT_AUTH}
              messageCount={messageCount}
              totalCostUsd={totalCostUsd}
              showCost={showCost}
              pendingAttachments={pendingAttachments}
              uploading={uploading}
              maxAttachments={MAX_ATTACHMENTS_AUTH}
              onUploadAttachment={handleUploadAttachment}
              onDeleteAttachment={handleDeleteAttachment}
              onSendMessage={handleSendMessage}
              onFeedback={handleFeedback}
              onFeedbackComment={handleFeedbackComment}
              onRegenerate={null}
              isRegenerating={isRegenerating}
              onShowPackage={null}
              showRegistrationButton={false}
              composerDisabled={composerLocked}
            />
          </div>
        </div>
      </OuterWrapper>
    );
  }
);

AuthenticatedBriefEditor.displayName = 'AuthenticatedBriefEditor';
