'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { styled } from 'styled-components';
import { App, Button, Modal } from 'antd';
import { t } from '@/lib/i18n';
import { ApiRoute } from '@/constants/apiRoute';
import { BriefEditor } from './BriefEditor';
import { BriefChatPanel } from '@/modules/client/BriefChatV2/BriefChatPanel';
import { BriefSharePopup } from '@/modules/BriefSharePopup/BriefSharePopup';
import { Spinner, GeneratingOverlay, GeneratingTitle, GeneratingSubtitle } from '@/modules/client/BriefChatV2/styled';
import {
  useStartBriefAiMutation,
  useLazyGetBriefAiStatusQuery,
  useSendBriefAiChatMutation,
  useGetBriefAiDetailQuery,
  useUpdateBriefAiSectionMutation,
  useSendBriefAiFeedbackMutation,
  useFinalizeBriefAiMutation,
} from '@/services/client/briefAiApi';
import { useGetBriefShareByBriefIdQuery } from '@/services/client/briefShareApi';
import { ChatMessageV2, ConversationPhase, SectionStatus, BriefV2ChatResponse } from '@/types/briefV2.interface';

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  background: #f8f9fb;
`;

const ActionBar = styled.div`
  padding: 8px 20px;
  border-bottom: 1px solid #eef0f4;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const HeroWrapper = styled.div`
  padding: 24px 32px;
  background: linear-gradient(90deg, #fff7f2 0%, #fff 100%);
  border-bottom: 1px solid #eef0f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeroTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

const HeroSubtitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #6b7280;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LayoutWrapper = styled.div`
  display: flex;
  height: calc(100vh - 70px);
  background: #f8f9fb;
`;

const StartScreen = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px;
`;

const StartTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: #1f2937;
  margin: 0;
`;

const StartSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  max-width: 500px;
  text-align: center;
  line-height: 1.6;
`;

const StartTextarea = styled.textarea`
  width: 100%;
  max-width: 600px;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2288ff;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const StartExample = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #9ca3af;
  margin: -12px 0 0;
  max-width: 600px;
  line-height: 1.5;
  font-style: italic;
`;

const MESSAGE_LIMIT = 50;
const POLL_INTERVAL = 1500;
const POLL_TIMEOUT = 120000;

interface BriefEditorLayoutProps {
  briefId: string | null;
}

export const BriefEditorLayout: React.FC<BriefEditorLayoutProps> = (props) => {
  const { message } = App.useApp();
  const [briefId, setBriefId] = useState<string | null>(props.briefId);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentHtml, setDocumentHtml] = useState('');
  const [sectionsStatus, setSectionsStatus] = useState<Record<string, SectionStatus>>({});
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('initial');
  const [briefStatus, setBriefStatus] = useState('DRAFT');
  const [messages, setMessages] = useState<ChatMessageV2[]>([]);
  const [sectionsChanged, setSectionsChanged] = useState<string[]>([]);
  const [totalCostUsd, setTotalCostUsd] = useState('0');
  const [version, setVersion] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startMessage, setStartMessage] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionRef = useRef(0);

  const [startBriefAi] = useStartBriefAiMutation();
  const [triggerStatus] = useLazyGetBriefAiStatusQuery();
  const [sendChat] = useSendBriefAiChatMutation();
  const [updateSection] = useUpdateBriefAiSectionMutation();
  const [sendFeedback] = useSendBriefAiFeedbackMutation();
  const [finalizeBrief] = useFinalizeBriefAiMutation();

  const { data: briefDetail } = useGetBriefAiDetailQuery(briefId!, {
    skip: !briefId || isGenerating,
    refetchOnMountOrArgChange: true,
  });

  const { data: briefShare } = useGetBriefShareByBriefIdQuery(briefId!, {
    skip: !briefId || briefStatus !== 'COMPLETED',
  });

  useEffect(() => {
    if (!briefDetail) {
      return;
    }
    setDocumentHtml(briefDetail.documentHtml);
    setSectionsStatus(briefDetail.sectionsStatus);
    setConversationPhase(briefDetail.conversationPhase);
    setBriefStatus(briefDetail.status);
    setMessages(briefDetail.messages);
    setTotalCostUsd(briefDetail.totalCostUsd);
    setVersion(briefDetail.version);
    versionRef.current = briefDetail.version;
    setMessageCount(briefDetail.messageCount);
  }, [briefDetail]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [stopPolling]);

  const startPolling = useCallback(
    (currentBriefId: string, currentTaskId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const result = await triggerStatus({
            briefId: currentBriefId,
            taskId: currentTaskId,
          }).unwrap();

          if (result.status === 'done' && result.result) {
            stopPolling();
            setIsGenerating(false);
            setDocumentHtml(result.result.documentHtml);
            setSectionsStatus(result.result.sectionsStatus);
            setConversationPhase(result.result.conversationPhase);
            setTotalCostUsd(result.result.totalCostUsd);
            setVersion(result.result.version);
            versionRef.current = result.result.version;
            setMessageCount(result.result.messageCount);
          } else if (result.status === 'failed') {
            stopPolling();
            setIsGenerating(false);
            message.error(t('BRIEF_V2_GENERATION_FAILED'));
          }
        } catch {
          stopPolling();
          setIsGenerating(false);
          message.error(t('BRIEF_V2_GENERATION_FAILED'));
        }
      }, POLL_INTERVAL);

      pollTimeoutRef.current = setTimeout(() => {
        stopPolling();
        setIsGenerating(false);
        message.error(t('BRIEF_V2_GENERATION_FAILED'));
      }, POLL_TIMEOUT);
    },
    [stopPolling, triggerStatus, message]
  );

  const handleStart = async () => {
    const trimmed = startMessage.trim();
    if (!trimmed || isStarting) {
      return;
    }

    setIsStarting(true);
    setIsGenerating(true);
    try {
      const result = await startBriefAi({ message: trimmed }).unwrap();
      setBriefId(result.briefId);
      setTaskId(result.taskId);

      const userMessage: ChatMessageV2 = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        sectionsChanged: [],
        modelUsed: '',
        inputTokens: 0,
        outputTokens: 0,
        costUsd: '0',
        createdAt: new Date().toISOString(),
      };
      setMessages([userMessage]);
      setIsStarting(false);

      startPolling(result.briefId, result.taskId);
    } catch {
      setIsGenerating(false);
      setIsStarting(false);
      message.error(t('BRIEF_V2_GENERATION_FAILED'));
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!briefId) {
      return;
    }

    const userMessage: ChatMessageV2 = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      sectionsChanged: [],
      modelUsed: '',
      inputTokens: 0,
      outputTokens: 0,
      costUsd: '0',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const result: BriefV2ChatResponse = await sendChat({
        briefId,
        message: text,
        documentHtml,
      }).unwrap();

      const assistantMessage: ChatMessageV2 = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        sectionsChanged: result.sectionsChanged,
        modelUsed: '',
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: result.costUsd,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setDocumentHtml(result.documentHtml);
      setSectionsStatus(result.sectionsStatus);
      setConversationPhase(result.conversationPhase);
      setSectionsChanged(result.sectionsChanged);
      setVersion(result.version);
      versionRef.current = result.version;
      setTotalCostUsd((prev) => {
        const total = parseFloat(prev) + parseFloat(result.costUsd);
        return total.toFixed(6);
      });
      setMessageCount((prev) => prev + 1);

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = setTimeout(() => setSectionsChanged([]), 2500);
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSectionEdit = useCallback(
    async (sectionKey: string, html: string) => {
      if (!briefId) {
        return;
      }
      try {
        const result = await updateSection({
          briefId,
          sectionKey,
          html,
          expectedVersion: versionRef.current,
        }).unwrap();
        setVersion(result.version);
        versionRef.current = result.version;

        setDocumentHtml((prev) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(prev, 'text/html');
          const sectionDiv = doc.querySelector(`[data-section="${sectionKey}"]`);

          if (sectionDiv) {
            sectionDiv.innerHTML = html;
            return doc.body.innerHTML;
          }

          return prev;
        });
      } catch (error: unknown) {
        const apiError = error as { status?: number; data?: { error?: string } };

        if (apiError.status === 409) {
          message.warning(t('BRIEF_V2_VERSION_CONFLICT'));
          window.location.reload();
        } else if (apiError.status === 400) {
          message.error(apiError.data?.error || t('UNEXPECTED_ERROR'));
        } else if (apiError.status && apiError.status >= 500) {
          message.error(t('UNEXPECTED_ERROR'));
        } else {
          message.error(t('UNEXPECTED_ERROR'));
        }
      }
    },
    [briefId, updateSection, message]
  );

  const handleFeedback = useCallback(
    async (messageId: string, rating: 'up' | 'down') => {
      if (!briefId) {
        return;
      }
      try {
        await sendFeedback({
          briefId,
          messageId,
          sectionKey: '',
          rating,
          comment: '',
        }).unwrap();
      } catch {
        // noop
      }
    },
    [briefId, sendFeedback]
  );

  const handleFeedbackComment = useCallback(
    async (messageId: string, rating: 'up' | 'down', comment: string) => {
      if (!briefId) {
        return;
      }
      try {
        await sendFeedback({
          briefId,
          messageId,
          sectionKey: '',
          rating,
          comment,
        }).unwrap();
      } catch {
        // noop
      }
    },
    [briefId, sendFeedback]
  );

  const handleFinalize = async () => {
    if (!briefId) {
      return;
    }
    try {
      await finalizeBrief(briefId).unwrap();
      message.success(t('BRIEF_V2_BRIEF_READY'));
      setBriefStatus('COMPLETED');
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handlePdf = async () => {
    if (!briefId) {
      return;
    }
    try {
      const { downloadPdf } = await import('@/helpers/downloadPdf');
      await downloadPdf(ApiRoute.BRIEF_AI_PDF(briefId), 'Brief.pdf');
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  if (!briefId) {
    return (
      <LayoutWrapper>
        <StartScreen>
          <StartTitle>{t('CREATE_BRIEF_TITLE')}</StartTitle>
          <StartSubtitle>{t('BRIEF_V2_PUBLIC_SUBTITLE')}</StartSubtitle>
          <StartTextarea
            value={startMessage}
            onChange={(event) => setStartMessage(event.target.value)}
            placeholder={t('BRIEF_V2_DESCRIBE_PROJECT')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && startMessage.trim()) {
                event.preventDefault();
                handleStart();
              }
            }}
          />
          <StartExample>{t('BRIEF_V2_START_EXAMPLE')}</StartExample>
          <Button
            type='primary'
            size='large'
            onClick={handleStart}
            disabled={!startMessage.trim() || isStarting}
            style={{ background: '#FD8258', borderColor: '#FD8258', fontWeight: 600, minWidth: 200 }}
          >
            {t('BRIEF_V2_CREATE_BUTTON')}
          </Button>
        </StartScreen>
      </LayoutWrapper>
    );
  }

  if (isGenerating) {
    return (
      <LayoutWrapper>
        <GeneratingOverlay>
          <Spinner />
          <GeneratingTitle>{t('BRIEF_V2_GENERATING')}</GeneratingTitle>
          <GeneratingSubtitle>{t('BRIEF_V2_GENERATING_SUBTITLE')}</GeneratingSubtitle>
        </GeneratingOverlay>
      </LayoutWrapper>
    );
  }

  const isCompleted = briefStatus === 'COMPLETED';
  const shareViewCount = briefShare?.viewCount ?? 0;
  const hasActiveShare = !!briefShare && briefShare.isActive;
  const heroVariant: 'cta' | 'views' | null = isCompleted
    ? hasActiveShare && shareViewCount > 0
      ? 'views'
      : 'cta'
    : null;

  const handleHeroShareClick = () => {
    setIsShareOpen(true);
  };

  const handleHeroCopyClick = async () => {
    if (!briefShare?.token || typeof window === 'undefined') {
      return;
    }
    const url = `${window.location.origin}/shared-brief/${briefShare.token}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success(t('COPIED'));
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  return (
    <OuterWrapper>
      {isCompleted && (
        <ActionBar>
          <Button onClick={() => setIsPreviewOpen(true)}>{t('BRIEF_V2_PREVIEW_AS_VENDOR')}</Button>
          <Button onClick={handlePdf}>{t('BRIEF_V2_EXPORT_PDF')}</Button>
          <Button onClick={() => setIsShareOpen(true)}>{t('BRIEF_V2_SHARE')}</Button>
        </ActionBar>
      )}
      {heroVariant === 'cta' && (
        <HeroWrapper>
          <HeroText>
            <HeroTitle>{t('BRIEF_V2_HERO_TITLE')}</HeroTitle>
            <HeroSubtitle>{t('BRIEF_V2_HERO_SUBTITLE')}</HeroSubtitle>
          </HeroText>
          <Button
            type='primary'
            size='large'
            onClick={handleHeroShareClick}
            style={{ background: '#FD8258', borderColor: '#FD8258', fontWeight: 600, minWidth: 220 }}
          >
            {t('BRIEF_V2_HERO_SHARE_CTA')}
          </Button>
        </HeroWrapper>
      )}
      {heroVariant === 'views' && briefShare && (
        <HeroWrapper>
          <HeroText>
            <HeroTitle>{t('BRIEF_V2_HERO_VIEWS_TITLE', String(shareViewCount))}</HeroTitle>
            <HeroSubtitle>
              {briefShare.lastViewedAt ? t('BRIEF_V2_HERO_VIEWS_SUBTITLE') : t('BRIEF_V2_HERO_SUBTITLE')}
            </HeroSubtitle>
          </HeroText>
          <Button
            type='primary'
            size='large'
            onClick={handleHeroCopyClick}
            style={{ background: '#22c55e', borderColor: '#22c55e', fontWeight: 600, minWidth: 220 }}
          >
            {t('BRIEF_V2_HERO_COPY_CTA')}
          </Button>
        </HeroWrapper>
      )}
      <ContentWrapper>
        <BriefEditor
          documentHtml={documentHtml}
          sectionsStatus={sectionsStatus}
          sectionsChanged={sectionsChanged}
          readOnly={false}
          totalCostUsd={totalCostUsd}
          onSectionEdit={handleSectionEdit}
        />
        <BriefChatPanel
          messages={messages}
          conversationPhase={conversationPhase}
          briefStatus={briefStatus}
          sectionsStatus={sectionsStatus}
          isLoading={isChatLoading}
          messageLimit={MESSAGE_LIMIT}
          messageCount={messageCount}
          totalCostUsd={totalCostUsd}
          onSendMessage={handleSendMessage}
          onFeedback={handleFeedback}
          onFeedbackComment={handleFeedbackComment}
          onFinalize={handleFinalize}
        />
      </ContentWrapper>
      {isCompleted && briefId && (
        <BriefSharePopup open={isShareOpen} onClose={() => setIsShareOpen(false)} briefId={briefId} />
      )}
      <Modal
        title={t('BRIEF_V2_PREVIEW_TITLE')}
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={900}
        styles={{ body: { padding: 0, maxHeight: '70vh', overflow: 'auto' } }}
        destroyOnClose
      >
        <div style={{ padding: '12px 24px', background: '#fff7f2', fontSize: 12, color: '#6b7280' }}>
          {t('BRIEF_V2_PREVIEW_DRAFT_NOTE')}
        </div>
        <BriefEditor
          documentHtml={documentHtml}
          sectionsStatus={sectionsStatus}
          sectionsChanged={[]}
          readOnly={true}
          totalCostUsd='0'
          onSectionEdit={null}
        />
      </Modal>
    </OuterWrapper>
  );
};
