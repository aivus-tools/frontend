'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { styled } from 'styled-components';
import { Button, message } from 'antd';
import { t } from '@/lib/i18n';
import { BriefEditor } from './BriefEditor';
import { BriefChatPanel } from '@/modules/client/BriefChatV2/BriefChatPanel';
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
import { ChatMessageV2, ConversationPhase, SectionStatus, BriefV2ChatResponse } from '@/types/briefV2.interface';

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

const FooterBar = styled.div`
  padding: 12px 20px;
  border-top: 1px solid #eef0f4;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const MESSAGE_LIMIT = 50;
const POLL_INTERVAL = 1500;
const POLL_TIMEOUT = 120000;

interface BriefEditorLayoutProps {
  briefId: string | null;
}

export const BriefEditorLayout: React.FC<BriefEditorLayoutProps> = (props) => {
  const [briefId, setBriefId] = useState<string | null>(props.briefId);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentHtml, setDocumentHtml] = useState('');
  const [sectionsStatus, setSectionsStatus] = useState<Record<string, SectionStatus>>({});
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('initial');
  const [messages, setMessages] = useState<ChatMessageV2[]>([]);
  const [sectionsChanged, setSectionsChanged] = useState<string[]>([]);
  const [totalCostUsd, setTotalCostUsd] = useState('0');
  const [version, setVersion] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startMessage, setStartMessage] = useState('');
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

  const { data: briefDetail } = useGetBriefAiDetailQuery(briefId!, { skip: !briefId || isGenerating });

  useEffect(() => {
    if (!briefDetail) {
      return;
    }
    setDocumentHtml(briefDetail.documentHtml);
    setSectionsStatus(briefDetail.sectionsStatus);
    setConversationPhase(briefDetail.conversationPhase);
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
    [stopPolling, triggerStatus]
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
      } catch (error: unknown) {
        const apiError = error as { status?: number };
        if (apiError.status === 409) {
          message.warning(t('BRIEF_V2_VERSION_CONFLICT'));
        }
      }
    },
    [briefId, updateSection]
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

  const handleFinalize = async () => {
    if (!briefId) {
      return;
    }
    try {
      await finalizeBrief(briefId).unwrap();
      message.success(t('BRIEF_V2_BRIEF_READY'));
      setConversationPhase('complete');
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

  return (
    <LayoutWrapper>
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
        isLoading={isChatLoading}
        messageLimit={MESSAGE_LIMIT}
        messageCount={messageCount}
        onSendMessage={handleSendMessage}
        onFeedback={handleFeedback}
      />
      {conversationPhase === 'complete' && (
        <FooterBar>
          <Button type='primary' onClick={handleFinalize} style={{ background: '#22c55e', borderColor: '#22c55e' }}>
            {t('BRIEF_V2_FINALIZE')}
          </Button>
        </FooterBar>
      )}
    </LayoutWrapper>
  );
};
