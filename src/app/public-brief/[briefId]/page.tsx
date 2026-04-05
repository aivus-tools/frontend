'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { styled } from 'styled-components';
import { Button, message } from 'antd';
import { t } from '@/lib/i18n';
import { BriefEditor } from '@/modules/client/BriefEditorV2/BriefEditor';
import { BriefChatPanel } from '@/modules/client/BriefChatV2/BriefChatPanel';
import { Spinner, GeneratingOverlay, GeneratingTitle, GeneratingSubtitle } from '@/modules/client/BriefChatV2/styled';
import {
  useLazyGetPublicBriefStatusQuery,
  useSendPublicBriefChatMutation,
  useGetPublicBriefDetailQuery,
  getPublicBriefToken,
} from '@/services/client/publicBriefApi';
import { ChatMessageV2, ConversationPhase, SectionStatus, BriefV2ChatResponse } from '@/types/briefV2.interface';
import { AppRoute } from '@/constants/appRoute';

const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  background: #f8f9fb;
`;

const RegistrationBanner = styled.div`
  padding: 16px 24px;
  background: linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%);
  border-top: 1px solid #c4d9f8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const BannerText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const MESSAGE_LIMIT = 20;
const POLL_INTERVAL = 1500;
const POLL_TIMEOUT = 120000;

export default function PublicBriefDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const briefId = params.briefId as string;
  const initialTaskId = searchParams.get('taskId');

  const [token] = useState<string | null>(() => getPublicBriefToken(briefId));
  const [isGenerating, setIsGenerating] = useState(!!initialTaskId);
  const [documentHtml, setDocumentHtml] = useState('');
  const [sectionsStatus, setSectionsStatus] = useState<Record<string, SectionStatus>>({});
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('initial');
  const [messages, setMessages] = useState<ChatMessageV2[]>([]);
  const [sectionsChanged, setSectionsChanged] = useState<string[]>([]);
  const [totalCostUsd, setTotalCostUsd] = useState('0');
  const [messageCount, setMessageCount] = useState(0);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [triggerStatus] = useLazyGetPublicBriefStatusQuery();
  const [sendChat] = useSendPublicBriefChatMutation();

  const skip = !briefId || !token || isGenerating;
  const { data: briefDetail } = useGetPublicBriefDetailQuery({ briefId, token: token ?? '' }, { skip });

  useEffect(() => {
    if (!briefDetail) {
      return;
    }
    setDocumentHtml(briefDetail.documentHtml);
    setSectionsStatus(briefDetail.sectionsStatus);
    setConversationPhase(briefDetail.conversationPhase);
    setMessages(briefDetail.messages);
    setTotalCostUsd(briefDetail.totalCostUsd);
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

  useEffect(() => {
    if (!initialTaskId || !token) {
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const result = await triggerStatus({
          briefId,
          taskId: initialTaskId,
          token,
        }).unwrap();

        if (result.status === 'done' && result.result) {
          stopPolling();
          setIsGenerating(false);
          setDocumentHtml(result.result.documentHtml);
          setSectionsStatus(result.result.sectionsStatus);
          setConversationPhase(result.result.conversationPhase);
          setTotalCostUsd(result.result.totalCostUsd);
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

    return stopPolling;
  }, [briefId, initialTaskId, token, triggerStatus, stopPolling]);

  const handleSendMessage = async (text: string) => {
    if (!token) {
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
        token,
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

  if (!token) {
    return (
      <LayoutWrapper>
        <GeneratingOverlay>
          <GeneratingTitle>Brief not found</GeneratingTitle>
          <GeneratingSubtitle>The link may have expired or the brief was already claimed.</GeneratingSubtitle>
          <Button
            type='primary'
            onClick={() => router.push(AppRoute.PUBLIC_BRIEF)}
            style={{ background: '#FD8258', borderColor: '#FD8258' }}
          >
            Create a new brief
          </Button>
        </GeneratingOverlay>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <LayoutWrapper>
        <BriefEditor
          documentHtml={documentHtml}
          sectionsStatus={sectionsStatus}
          sectionsChanged={sectionsChanged}
          readOnly={true}
          totalCostUsd={totalCostUsd}
          onSectionEdit={null}
        />
        <BriefChatPanel
          messages={messages}
          conversationPhase={conversationPhase}
          isLoading={isChatLoading}
          messageLimit={MESSAGE_LIMIT}
          messageCount={messageCount}
          onSendMessage={handleSendMessage}
          onFeedback={null}
        />
      </LayoutWrapper>
      {conversationPhase === 'complete' && (
        <RegistrationBanner>
          <BannerText>{t('BRIEF_V2_REGISTER_CTA')}</BannerText>
          <Button
            type='primary'
            onClick={() => router.push(`/auth?redirect=/public-brief/${briefId}/claim`)}
            style={{ background: '#2288FF', borderColor: '#2288FF', fontWeight: 600 }}
          >
            {t('BRIEF_V2_REGISTER_BUTTON')}
          </Button>
        </RegistrationBanner>
      )}
    </div>
  );
}
