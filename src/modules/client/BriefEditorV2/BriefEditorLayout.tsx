'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { styled } from 'styled-components';
import { App, Button } from 'antd';
import { useAppDispatch } from '@/store/hooks';
import { t, getLocale } from '@/lib/i18n';
import { BriefChatPanel } from '@/modules/client/BriefChatV2/BriefChatPanel';
import { VoiceRecorderButton } from '@/modules/client/BriefChatV2/VoiceRecorderButton';
import { ComparisonTable } from '@/modules/client/ComparisonTable/ComparisonTable';
import { FileUploadZone } from './components/FileUploadZone';
import { BriefFinalPackage } from './BriefFinalPackage';
import { BriefSettings } from './BriefSettings';
import { EditableBriefTitle } from './components/EditableBriefTitle';
import { GeneratingOverlay, GeneratingSubtitle, GeneratingTitle, Spinner } from '@/modules/client/BriefChatV2/styled';
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
import { BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';
import { useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 180000;

const MESSAGE_LIMIT_AUTH = 100;
const MESSAGE_LIMIT_ANON = 50;
const MAX_ATTACHMENTS_AUTH = 10;
const MAX_ATTACHMENTS_ANON = 3;

type Stage = 'start' | 'generating' | 'chat' | 'finalizing' | 'finalized' | 'comparison' | 'settings';

const OuterWrapper = styled.div<{ $footerVisible: boolean }>`
  display: flex;
  flex-direction: column;
  height: ${(x) => (x.$footerVisible ? `calc(100vh - 70px - ${BETA_FOOTER_HEIGHT}px)` : 'calc(100vh - 70px)')};
  background: #f8f9fb;
`;

const StartScreen = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const StartCard = styled.div`
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StartTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: #1f2937;
  margin: 0;
`;

const StartSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
`;

const StartTextarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 14px 16px;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #1f2937;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2288ff;
    box-shadow: 0 0 0 3px rgba(34, 136, 255, 0.15);
  }
`;

const StartActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const StartVoiceGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const StartVoiceHint = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #99a1b7;
`;

const ChatScreen = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: #f8f9fb;
  padding: 16px 0;
`;

const ChatWrapper = styled.div`
  width: 83.333%;
  max-width: 1200px;
  display: flex;
  background: #ffffff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const FinalSplit = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
`;

const FinalDocsColumn = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FinalChatColumn = styled.div`
  flex: 0 1 480px;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #eef0f4;
  border-left: 1px solid #eef0f4;
  background: #ffffff;
  overflow: hidden;
`;

interface BriefEditorLayoutProps {
  mode: 'authenticated' | 'anonymous';
  briefId?: string | null;
  token?: string | null;
  initialTaskId?: string | null;
  onBriefCreated?: (briefId: string, token?: string) => void;
  onRegisterClick?: (briefId: string | null, token: string | null) => void;
}

export const BriefEditorLayout: React.FC<BriefEditorLayoutProps> = (props) => {
  const { message: messageApi } = App.useApp();
  const dispatch = useAppDispatch();
  const isAuth = props.mode === 'authenticated';

  const [briefId, setBriefId] = useState<string | null>(props.briefId ?? null);
  const [stage, setStage] = useState<Stage>(props.briefId ? 'chat' : 'start');
  const [hasMounted, setHasMounted] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const { dismissed: footerDismissed } = useBetaFooter();
  const footerVisible = !footerDismissed;

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
  const [showCost, setShowCost] = useState<boolean>(false);

  // Auth API hooks
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
    refetch: refetchAuthDetail,
  } = useGetBriefAiDetailQuery(briefId ?? '', {
    skip: !briefId || !isAuth || stage === 'start' || stage === 'generating',
    refetchOnMountOrArgChange: true,
  });
  const {
    data: authFinalDocs,
    refetch: refetchAuthFinal,
    isFetching: isAuthFinalFetching,
  } = useGetBriefAiFinalDocumentsQuery(briefId ?? '', {
    skip: !briefId || !isAuth || stage !== 'finalized',
    refetchOnMountOrArgChange: true,
  });

  // Public API hooks
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
    // Anonymous users can't finalize; tapping "register" should redirect to
    // the auth flow. The actual claim call happens on the post-auth route
    // /app/brief/claim/{briefId} once the user is signed in.
    props.onRegisterClick?.(briefId, token);
  }, [briefId, props, token]);

  const finalPackage = isAuth ? authFinalDocs : null;
  const messageLimit = isAuth ? MESSAGE_LIMIT_AUTH : MESSAGE_LIMIT_ANON;
  const maxAttachments = isAuth ? MAX_ATTACHMENTS_AUTH : MAX_ATTACHMENTS_ANON;

  if (stage === 'start') {
    return (
      <OuterWrapper $footerVisible={footerVisible}>
        <StartScreen>
          <StartCard>
            <StartTitle>{t('BRIEF_V3_START_TITLE')}</StartTitle>
            <StartSubtitle>{t('BRIEF_V3_START_SUBTITLE')}</StartSubtitle>
            <StartTextarea
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
            <StartActions>
              <StartVoiceGroup>
                <VoiceRecorderButton
                  briefId={briefId}
                  isPublic={!isAuth}
                  publicToken={token ?? null}
                  disabled={isStarting || uploading}
                  onTranscript={(text) =>
                    setStartText((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${text}` : text))
                  }
                  onEnsureBrief={ensureDraft}
                  compact
                />
                <StartVoiceHint>{t('BRIEF_V3_VOICE_START_HINT')}</StartVoiceHint>
              </StartVoiceGroup>
              <Button
                type='primary'
                size='large'
                loading={isStarting}
                disabled={!startText.trim() || uploading}
                onClick={handleStart}
              >
                {t('BRIEF_V3_START_BUTTON')}
              </Button>
            </StartActions>
          </StartCard>
        </StartScreen>
      </OuterWrapper>
    );
  }

  if (stage === 'generating' || stage === 'finalizing') {
    return (
      <OuterWrapper $footerVisible={footerVisible}>
        <GeneratingOverlay>
          <Spinner />
          <GeneratingTitle>
            {stage === 'generating' ? t('BRIEF_V3_GENERATING_TITLE') : t('BRIEF_V3_FINALIZING_TITLE')}
          </GeneratingTitle>
          <GeneratingSubtitle>
            {stage === 'generating' ? t('BRIEF_V3_GENERATING_SUBTITLE') : t('BRIEF_V3_FINALIZING_SUBTITLE')}
          </GeneratingSubtitle>
        </GeneratingOverlay>
      </OuterWrapper>
    );
  }

  const pageTitleHeader =
    isAuth && briefId && headerSlot
      ? createPortal(<EditableBriefTitle briefId={briefId} title={authDetail?.title ?? ''} editable />, headerSlot)
      : null;

  if (stage === 'comparison' && briefId) {
    return (
      <OuterWrapper $footerVisible={footerVisible}>
        {pageTitleHeader}
        <ComparisonTable briefId={briefId} />
      </OuterWrapper>
    );
  }

  if (stage === 'settings' && briefId && authDetail) {
    return (
      <OuterWrapper $footerVisible={footerVisible}>
        {pageTitleHeader}
        <BriefSettings brief={authDetail} />
      </OuterWrapper>
    );
  }

  if (stage === 'finalized') {
    return (
      <OuterWrapper $footerVisible={footerVisible}>
        {pageTitleHeader}
        {finalPackage ? (
          <FinalSplit>
            <FinalDocsColumn>
              <BriefFinalPackage
                briefId={briefId!}
                package={finalPackage}
                onRegenerate={isAuth ? handleRegenerate : null}
                isRegenerating={isRegenerating}
              />
            </FinalDocsColumn>
            <FinalChatColumn>
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
            </FinalChatColumn>
          </FinalSplit>
        ) : (
          <GeneratingOverlay>
            <Spinner />
            <GeneratingTitle>{t('BRIEF_V3_LOADING_DOCS_TITLE')}</GeneratingTitle>
            <GeneratingSubtitle>{t('BRIEF_V3_LOADING_DOCS_SUBTITLE')}</GeneratingSubtitle>
          </GeneratingOverlay>
        )}
      </OuterWrapper>
    );
  }

  const showRegistrationButton =
    !isAuth && (conversationStatus === 'ready_to_finalize' || conversationStatus === 'finalized');

  // Avoid flashing an empty chat panel while the initial detail/status is
  // still arriving from the server. This window is short, but for already
  // finalized briefs it would otherwise look like the brief has no content
  // until `hydrateFromDetail` flips the stage.
  const isHydrating =
    hasMounted &&
    stage === 'chat' &&
    briefId &&
    ((isAuth && !authDetail && isAuthDetailFetching) || (!isAuth && token && !publicDetail));
  if (isHydrating) {
    return (
      <OuterWrapper $footerVisible={footerVisible}>
        <GeneratingOverlay>
          <Spinner />
          <GeneratingTitle>{t('BRIEF_V3_LOADING_BRIEF_TITLE')}</GeneratingTitle>
          <GeneratingSubtitle>{t('BRIEF_V3_LOADING_BRIEF_SUBTITLE')}</GeneratingSubtitle>
        </GeneratingOverlay>
      </OuterWrapper>
    );
  }

  return (
    <OuterWrapper $footerVisible={footerVisible}>
      {pageTitleHeader}
      <ChatScreen>
        <ChatWrapper>
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
        </ChatWrapper>
      </ChatScreen>
    </OuterWrapper>
  );
};
