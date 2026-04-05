'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { ChatMessageV2, ConversationPhase } from '@/types/briefV2.interface';
import {
  ChatPanel,
  ChatHeader,
  ChatTitle,
  ChatPhase,
  MessagesArea,
  MessageRow,
  MessageBubble,
  MessageMeta,
  MessageTime,
  SectionBadge,
  FeedbackRow,
  FeedbackButton,
  TypingIndicator,
  TypingDot,
  InputArea,
  ChatInputWrapper,
  LimitBadge,
} from './styled';

const TextArea = Input.TextArea;

interface BriefChatPanelProps {
  messages: ChatMessageV2[];
  conversationPhase: ConversationPhase;
  isLoading: boolean;
  messageLimit: number;
  messageCount: number;
  onSendMessage: (message: string) => void;
  onFeedback: ((messageId: string, rating: 'up' | 'down') => void) | null;
}

const PHASE_LABELS: Record<ConversationPhase, string> = {
  initial: 'Starting',
  questioning: 'Asking questions',
  refining: 'Refining',
  complete: 'Complete',
};

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const BriefChatPanel: React.FC<BriefChatPanelProps> = (props) => {
  const [inputValue, setInputValue] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [props.messages, props.isLoading, scrollToBottom]);

  useEffect(() => {
    if (!props.isLoading) {
      inputRef.current?.focus();
    }
  }, [props.isLoading]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || props.isLoading) {
      return;
    }
    props.onSendMessage(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = (messageId: string, rating: 'up' | 'down') => {
    if (!props.onFeedback) {
      return;
    }
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: rating }));
    props.onFeedback(messageId, rating);
  };

  const isLimitReached = props.messageCount >= props.messageLimit;

  return (
    <ChatPanel>
      <ChatHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ChatTitle>Chat</ChatTitle>
          <ChatPhase>{PHASE_LABELS[props.conversationPhase]}</ChatPhase>
        </div>
      </ChatHeader>

      <MessagesArea>
        {props.messages.map((message) => (
          <div key={message.id}>
            <MessageRow $isUser={message.role === 'user'}>
              <MessageBubble $isUser={message.role === 'user'}>{message.content}</MessageBubble>
            </MessageRow>
            <MessageMeta $isUser={message.role === 'user'}>
              <MessageTime $isUser={message.role === 'user'}>{formatTime(message.createdAt)}</MessageTime>
              {message.role === 'assistant' &&
                message.sectionsChanged.length > 0 &&
                message.sectionsChanged.map((key) => <SectionBadge key={key}>{key.replace(/_/g, ' ')}</SectionBadge>)}
            </MessageMeta>
            {message.role === 'assistant' && props.onFeedback && (
              <FeedbackRow>
                <FeedbackButton
                  $active={feedbackGiven[message.id] === 'up'}
                  onClick={() => handleFeedback(message.id, 'up')}
                >
                  <LikeOutlined />
                </FeedbackButton>
                <FeedbackButton
                  $active={feedbackGiven[message.id] === 'down'}
                  onClick={() => handleFeedback(message.id, 'down')}
                >
                  <DislikeOutlined />
                </FeedbackButton>
              </FeedbackRow>
            )}
          </div>
        ))}

        {props.isLoading && (
          <MessageRow $isUser={false}>
            <TypingIndicator>
              <TypingDot $delay={0} />
              <TypingDot $delay={200} />
              <TypingDot $delay={400} />
            </TypingIndicator>
          </MessageRow>
        )}

        <div ref={messagesEndRef} />
      </MessagesArea>

      <InputArea>
        {isLimitReached ? (
          <LimitBadge>{t('BRIEF_V2_MESSAGE_LIMIT')}</LimitBadge>
        ) : (
          <>
            <ChatInputWrapper>
              <TextArea
                ref={inputRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('BRIEF_V2_SEND_PLACEHOLDER')}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={props.isLoading || props.conversationPhase === 'complete'}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 13,
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              />
            </ChatInputWrapper>
            <Button
              type='primary'
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || props.isLoading || props.conversationPhase === 'complete'}
              style={{
                background: '#FD8258',
                borderColor: '#FD8258',
                borderRadius: 10,
                height: 38,
                width: 38,
              }}
            />
          </>
        )}
      </InputArea>
    </ChatPanel>
  );
};
