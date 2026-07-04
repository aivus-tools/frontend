'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Empty } from 'antd';
import { useRouter } from 'next/navigation';
import { AppRoute } from '@/constants/appRoute';
import { useAppDispatch } from '@/store/hooks';
import { t } from '@/lib/i18n';
import { BriefChatPanel } from '@/modules/client/BriefChat/BriefChatPanel';
import {
  publicBriefApi,
  savePublicBriefToken,
  useCreatePublicBriefDraftMutation,
  useCreatePublicBriefDraftBySlugMutation,
  useDeletePublicBriefAttachmentMutation,
  useGetPublicBriefDetailQuery,
  useGetPublicBriefFinalDocumentsQuery,
  useSendPublicBriefChatMutation,
  useStartPublicBriefMutation,
  useUploadPublicBriefAttachmentMutation,
} from '@/services/client/publicBriefApi';
import { BriefAttachment, BriefV3Detail } from '@/types/briefAi.interface';
import { useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { OuterWrapper } from './components/OuterWrapper';
import { GeneratingView } from './components/GeneratingView';
import { BriefStartScreen } from './components/BriefStartScreen';
import { useBriefPolling } from './hooks/useBriefPolling';
import { deriveStage, lastMessageIsAssistant } from './lib/deriveStage';
import { makeLocalUserMessage } from './lib/makeLocalUserMessage';
import { MAX_ATTACHMENTS_ANON, MESSAGE_LIMIT_ANON } from './constants';

import styles from './BriefEditor.module.css';

interface AnonymousBriefEditorProps {
  briefId?: string | null;
  token?: string | null;
  initialTaskId?: string | null;
  whiteLabel?: boolean;
  alreadySent?: boolean;
  getLatestDocumentHtml?: () => string | null;
  onBriefCreated?: (briefId: string, token?: string) => void;
  onRegisterClick?: (briefId: string | null, token: string | null, email: string | null) => void;
  embedded?: boolean;
  slug?: string | null;
}

export const AnonymousBriefEditor = (props: AnonymousBriefEditorProps) => {
  const { message: messageApi } = App.useApp();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [briefId, setBriefId] = useState<string | null>(props.briefId ?? null);
  const [token, setToken] = useState<string | null>(props.token ?? null);
  const [localTaskId, setLocalTaskId] = useState<string | null>(props.initialTaskId ?? null);
  const [startText, setStartText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<BriefAttachment[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStartVoiceBusy, setIsStartVoiceBusy] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const createdLocallyRef = useRef(false);
  const draftPromiseRef = useRef<Promise<{ briefId: string; token: string | null } | null> | null>(null);

  const { dismissed: footerDismissed } = useBetaFooter();
  const footerVisible = !footerDismissed;
  const footerHeight = useBetaFooterHeight();

  const [createDraft] = useCreatePublicBriefDraftMutation();
  const [createDraftBySlug] = useCreatePublicBriefDraftBySlugMutation();
  const [startBrief] = useStartPublicBriefMutation();
  const [sendChat] = useSendPublicBriefChatMutation();
  const [uploadAttach] = useUploadPublicBriefAttachmentMutation();
  const [deleteAttach] = useDeletePublicBriefAttachmentMutation();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Adopt a resumed draft (parent sets briefId/token after mount, e.g. from the
  // draft cookie) as long as we have not created our own draft yet — otherwise
  // the first message would spawn a new draft and abandon the resumed one.
  useEffect(() => {
    if (props.briefId && !briefId) {
      setBriefId(props.briefId);
      setToken(props.token ?? null);
    }
  }, [props.briefId, props.token, briefId]);

  const canQueryDetail = !!briefId && !!token;
  const { data: finalDocuments } = useGetPublicBriefFinalDocumentsQuery(
    { briefId: briefId ?? '', token: token ?? '' },
    { skip: !canQueryDetail || !props.whiteLabel }
  );
  const { data: detail, isFetching: isDetailFetching } = useGetPublicBriefDetailQuery(
    { briefId: briefId ?? '', token: token ?? '' },
    { skip: !canQueryDetail, refetchOnMountOrArgChange: true }
  );

  const pendingTaskId = detail?.pendingTaskId || localTaskId || null;
  const stage = deriveStage({
    hasBrief: !!briefId,
    openedExisting: !!props.briefId && !createdLocallyRef.current,
    detail,
    isStarting,
    pendingTaskId,
  });

  const messages = detail?.messages ?? [];
  const conversationStatus = detail?.conversationStatus ?? 'in_progress';
  const messageCount = detail?.messageCount ?? 0;
  const totalCostUsd = detail?.totalCostUsd ?? '0';
  const showCost = !!detail?.showCost;
  const registrationEmail = detail?.contactEmail ?? null;

  const handleDone = useCallback(
    (result: BriefV3Detail) => {
      setLocalTaskId(null);
      if (briefId && token) {
        dispatch(
          publicBriefApi.util.updateQueryData('getPublicBriefDetail', { briefId, token }, (draft) => {
            Object.assign(draft, result);
          })
        );
      }
      if (!lastMessageIsAssistant(result)) {
        messageApi.error(t('BRIEF_V3_GENERATION_FAILED'));
      }
    },
    [briefId, dispatch, messageApi, token]
  );

  const handleFailed = useCallback(() => {
    setLocalTaskId(null);
    messageApi.error(t('BRIEF_V3_GENERATION_FAILED'));
  }, [messageApi]);

  const handleTimeout = useCallback(() => {
    setLocalTaskId(null);
    messageApi.error(t('BRIEF_V3_GENERATION_TIMEOUT'));
  }, [messageApi]);

  useBriefPolling({
    enabled: !!pendingTaskId && !!briefId && !!token,
    briefId,
    isAuth: false,
    token,
    taskId: pendingTaskId,
    onDone: handleDone,
    onFailed: handleFailed,
    onTimeout: handleTimeout,
  });

  const ensureDraft = useCallback(async (): Promise<{ briefId: string; token: string | null } | null> => {
    if (briefId) {
      return { briefId, token };
    }
    // Guard against concurrent callers (upload + start, voice + click): briefId
    // state has not updated yet, so a naive check would let both create a draft
    // and — with the personal-link flow — spawn a duplicate vendor lead. The
    // first caller owns the in-flight promise; the rest await it.
    if (draftPromiseRef.current) {
      return draftPromiseRef.current;
    }
    const promise = (async () => {
      try {
        const response = props.slug ? await createDraftBySlug(props.slug).unwrap() : await createDraft().unwrap();
        // Mark the draft as locally created so the start screen does not flip to
        // the "loading existing brief" view (which would unmount the start screen
        // and the in-progress voice recorder) once the parent feeds briefId back.
        createdLocallyRef.current = true;
        setBriefId(response.briefId);
        setToken(response.token);
        savePublicBriefToken(response.briefId, response.token);
        props.onBriefCreated?.(response.briefId, response.token);
        return { briefId: response.briefId, token: response.token };
      } catch {
        // Clear the ref so a later action can retry after a failed creation.
        draftPromiseRef.current = null;
        messageApi.error(t('UNEXPECTED_ERROR'));
        return null;
      }
    })();
    draftPromiseRef.current = promise;
    return promise;
  }, [briefId, createDraft, createDraftBySlug, messageApi, props, token]);

  const handleUploadAttachment = useCallback(
    async (file: File) => {
      const draft = await ensureDraft();
      if (!draft) {
        return;
      }
      setUploading(true);
      try {
        const attachment = await uploadAttach({ briefId: draft.briefId, token: draft.token ?? '', file }).unwrap();
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
        await deleteAttach({ briefId, attachmentId, token: token ?? '' }).unwrap();
        setPendingAttachments((prev) => prev.filter((x) => x.id !== attachmentId));
      } catch {
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
    },
    [briefId, deleteAttach, messageApi, token]
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
        token: draft.token ?? '',
        message: trimmed,
        attachmentIds: pendingAttachments.map((x) => x.id),
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
      if (!briefId || !token || isChatLoading || pendingTaskId) {
        return;
      }
      setIsChatLoading(true);
      const localMessage = makeLocalUserMessage(
        text,
        pendingAttachments.filter((x) => attachmentIds.includes(x.id))
      );
      const patch = dispatch(
        publicBriefApi.util.updateQueryData('getPublicBriefDetail', { briefId, token }, (draft) => {
          draft.messages.push(localMessage);
        })
      );
      setPendingAttachments((prev) => prev.filter((x) => !attachmentIds.includes(x.id)));
      const latestHtml = props.getLatestDocumentHtml?.() ?? null;
      const whiteLabelFallback = props.whiteLabel
        ? (finalDocuments?.documents.find((x) => x.kind === 'production_brief')?.html ?? null)
        : null;
      const productionBriefHtml = latestHtml ?? whiteLabelFallback;
      try {
        await sendChat({ briefId, token, message: text, attachmentIds, documentHtml: productionBriefHtml }).unwrap();
      } catch (error) {
        patch.undo();
        const status = typeof error === 'object' && error != null ? (error as { status?: unknown }).status : null;
        if (status === 409) {
          messageApi.warning(t('BRIEF_ALREADY_SENT_EDIT_BLOCKED'));
        } else {
          messageApi.error(t('UNEXPECTED_ERROR'));
        }
      } finally {
        setIsChatLoading(false);
      }
    },
    [
      briefId,
      dispatch,
      finalDocuments,
      isChatLoading,
      messageApi,
      pendingAttachments,
      pendingTaskId,
      props,
      sendChat,
      token,
    ]
  );

  const handleRegisterClick = useCallback(
    (email: string | null) => {
      props.onRegisterClick?.(briefId, token, email);
    },
    [briefId, props, token]
  );

  if (hasMounted && briefId && !token) {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight} fill={!!props.whiteLabel}>
        <div className={styles.notFoundWrapper}>
          <Empty description={t('BRIEF_LINK_BROKEN')}>
            <Button type='primary' onClick={() => router.replace(AppRoute.PUBLIC_BRIEF)}>
              {t('BRIEF_NEW')}
            </Button>
          </Empty>
        </div>
      </OuterWrapper>
    );
  }

  if (stage === 'start') {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight} fill={!!props.whiteLabel}>
        <BriefStartScreen
          startText={startText}
          onStartTextChange={setStartText}
          pendingAttachments={pendingAttachments}
          uploading={uploading}
          maxAttachments={MAX_ATTACHMENTS_ANON}
          onUploadAttachment={handleUploadAttachment}
          onDeleteAttachment={handleDeleteAttachment}
          briefId={briefId}
          isPublic
          token={token}
          isStarting={isStarting}
          isStartVoiceBusy={isStartVoiceBusy}
          onStartVoiceBusyChange={setIsStartVoiceBusy}
          onEnsureBrief={ensureDraft}
          onStart={handleStart}
          embedded={props.embedded}
        />
      </OuterWrapper>
    );
  }

  if (stage === 'generating') {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight} fill={!!props.whiteLabel}>
        <GeneratingView title={t('BRIEF_V3_GENERATING_TITLE')} subtitle={t('BRIEF_V3_GENERATING_SUBTITLE')} />
      </OuterWrapper>
    );
  }

  const isHydrating = hasMounted && !!briefId && !!token && !detail && isDetailFetching;
  if (isHydrating) {
    return (
      <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight} fill={!!props.whiteLabel}>
        <GeneratingView title={t('BRIEF_V3_LOADING_BRIEF_TITLE')} subtitle={t('BRIEF_V3_LOADING_BRIEF_SUBTITLE')} />
      </OuterWrapper>
    );
  }

  const showRegistrationButton =
    !props.whiteLabel && (conversationStatus === 'ready_to_finalize' || conversationStatus === 'finalized');

  return (
    <OuterWrapper footerVisible={footerVisible} footerHeight={footerHeight} fill={!!props.whiteLabel}>
      <div className={styles.chatScreen}>
        <div className={styles.chatWrapper}>
          <BriefChatPanel
            briefId={briefId ?? undefined}
            isPublic
            publicToken={token}
            messages={messages}
            conversationStatus={conversationStatus}
            isLoading={isChatLoading}
            messageLimit={MESSAGE_LIMIT_ANON}
            messageCount={messageCount}
            totalCostUsd={totalCostUsd}
            showCost={showCost}
            pendingAttachments={pendingAttachments}
            uploading={uploading}
            maxAttachments={MAX_ATTACHMENTS_ANON}
            onUploadAttachment={handleUploadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
            onSendMessage={handleSendMessage}
            onFeedback={null}
            onFeedbackComment={null}
            onRegenerate={null}
            onShowPackage={null}
            showRegistrationButton={showRegistrationButton}
            registrationEmail={registrationEmail}
            onRegisterClick={handleRegisterClick}
            composerDisabled={!!pendingTaskId || !!props.alreadySent}
            embedded={props.embedded}
          />
        </div>
      </div>
    </OuterWrapper>
  );
};
