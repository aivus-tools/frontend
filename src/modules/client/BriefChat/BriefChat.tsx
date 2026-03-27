'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined, CheckCircleFilled } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useSendMessageMutation } from '@/services/client/chatApi';
import { ChatMessage } from '@/types/chat.interface';
import { Details } from '@/types/brief.interface';
import {
  ChatPageWrapper,
  ChatArea,
  ChatHeader,
  ChatTitle,
  ChatSubtitle,
  MessagesContainer,
  MessageRow,
  MessageBubble,
  MessageTimestamp,
  TypingIndicator,
  TypingDot,
  InputArea,
  ChatInputWrapper,
  GuidancePanel,
  GuidanceTitle,
  GuidanceText,
  GuidanceStep,
  StepNumber,
  StepLabel,
  CompleteBanner,
  CompleteBannerText,
} from './styled';

const { TextArea } = Input;

interface BriefChatProps {
  onComplete: (briefData: Partial<Details>) => void;
  onSkip: () => void;
}

const GUIDANCE_STEPS = [
  { key: 'project', label: 'PROJECT_NAME' },
  { key: 'description', label: 'PROJECT_DESCRIPTION' },
  { key: 'references', label: 'REFERENCE_VIDEOS' },
  { key: 'budget', label: 'CLIENT_BUDGET' },
  { key: 'specs', label: 'RIGHTS_AND_TECHNICAL_SPECIFICATIONS' },
];

export const BriefChat: React.FC<BriefChatProps> = ({ onComplete, onSkip }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('AI_BRIEF_WELCOME'),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [briefData, setBriefData] = useState<Partial<Details> | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [sendMessage] = useSendMessageMutation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await sendMessage({
        message: trimmedInput,
        history: [...history, { role: 'user', content: trimmedInput }],
      }).unwrap();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result.brief_data) {
        setBriefData(result.brief_data as Partial<Details>);
      }

      if (result.is_complete && result.brief_data) {
        setIsComplete(true);
        setBriefData(result.brief_data as Partial<Details>);
      }

      // Advance guidance step heuristically based on message count
      const totalMessages = messages.length + 2; // including new pair
      const newStep = Math.min(Math.floor(totalMessages / 3), GUIDANCE_STEPS.length - 1);
      setCurrentStep(newStep);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('UNEXPECTED_ERROR'),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContinueToForm = () => {
    if (briefData) {
      onComplete(briefData);
    }
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChatPageWrapper>
      <ChatArea>
        <ChatHeader>
          <ChatTitle>{t('CREATE_BRIEF_TITLE')}</ChatTitle>
          <ChatSubtitle>{t('AI_BRIEF_SUBTITLE')}</ChatSubtitle>
        </ChatHeader>

        <MessagesContainer>
          {messages.map((message) => (
            <MessageRow key={message.id} $isUser={message.role === 'user'}>
              <MessageBubble $isUser={message.role === 'user'}>
                {message.content}
                <MessageTimestamp $isUser={message.role === 'user'}>
                  {formatTimestamp(message.timestamp)}
                </MessageTimestamp>
              </MessageBubble>
            </MessageRow>
          ))}

          {isTyping && (
            <MessageRow $isUser={false}>
              <TypingIndicator>
                <TypingDot $delay={0} />
                <TypingDot $delay={200} />
                <TypingDot $delay={400} />
              </TypingIndicator>
            </MessageRow>
          )}

          {isComplete && (
            <CompleteBanner>
              <CheckCircleFilled style={{ color: '#4CAF50', fontSize: 20 }} />
              <CompleteBannerText>{t('AI_BRIEF_COMPLETE')}</CompleteBannerText>
            </CompleteBanner>
          )}

          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputArea>
          {isComplete ? (
            <>
              <Button
                type="primary"
                size="large"
                onClick={handleContinueToForm}
                style={{ background: '#FD8258', borderColor: '#FD8258', fontWeight: 600 }}
              >
                {t('CONTINUE_TO_FORM')}
              </Button>
              <Button size="large" onClick={onSkip}>
                {t('EDIT_MANUALLY')}
              </Button>
            </>
          ) : (
            <>
              <ChatInputWrapper>
                <TextArea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('AI_BRIEF_PLACEHOLDER')}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={isTyping}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 14,
                    borderRadius: 12,
                    padding: '10px 16px',
                  }}
                />
              </ChatInputWrapper>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                style={{
                  background: '#FD8258',
                  borderColor: '#FD8258',
                  borderRadius: 12,
                  height: 42,
                  width: 42,
                }}
              />
            </>
          )}
        </InputArea>
      </ChatArea>

      <GuidancePanel>
        <GuidanceTitle>{t('GUIDANCE')}</GuidanceTitle>
        <GuidanceText>{t('AI_BRIEF_GUIDANCE_TEXT')}</GuidanceText>

        {GUIDANCE_STEPS.map((step, index) => (
          <GuidanceStep key={step.key} $active={index === currentStep}>
            <StepNumber
              $active={index === currentStep}
              $completed={index < currentStep}
            >
              {index < currentStep ? '\u2713' : index + 1}
            </StepNumber>
            <StepLabel $active={index === currentStep}>
              {t(step.label as Parameters<typeof t>[0])}
            </StepLabel>
          </GuidanceStep>
        ))}

        <div style={{ marginTop: 24 }}>
          <Button type="link" onClick={onSkip} style={{ padding: 0, color: '#99a1b7' }}>
            {t('SKIP_AI_FILL_MANUALLY')}
          </Button>
        </div>
      </GuidancePanel>
    </ChatPageWrapper>
  );
};
