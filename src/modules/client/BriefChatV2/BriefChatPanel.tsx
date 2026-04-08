'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Modal } from 'antd';
import { SendOutlined, LikeOutlined, DislikeOutlined, CommentOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import {
  ChatMessageV2,
  ConversationPhase,
  SectionStatus,
  SECTION_DISPLAY_NAMES,
  BriefSectionKey,
} from '@/types/briefV2.interface';
import {
  ChatPanel,
  ChatHeader,
  ChatTitle,
  ChatPhase,
  ProgressBar,
  ProgressFill,
  ProgressText,
  MessagesArea,
  MessageRow,
  MessageBubble,
  MessageMeta,
  MessageTime,
  SectionBadge,
  FeedbackRow,
  FeedbackButton,
  CommentModalBody,
  CommentRatingRow,
  CommentRatingButton,
  CommentContext,
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
  briefStatus: string;
  sectionsStatus: Record<string, SectionStatus>;
  isLoading: boolean;
  messageLimit: number;
  messageCount: number;
  onSendMessage: (message: string) => void;
  onFeedback: ((messageId: string, rating: 'up' | 'down') => void) | null;
  onFeedbackComment: ((messageId: string, rating: 'up' | 'down', comment: string) => void) | null;
  onFinalize: (() => void) | null;
  showRegistrationButton?: boolean;
  onRegisterClick?: () => void;
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

const getSectionDisplayName = (key: string): string => {
  return SECTION_DISPLAY_NAMES[key as BriefSectionKey] ?? key.replace(/_/g, ' ');
};

export const BriefChatPanel: React.FC<BriefChatPanelProps> = (props) => {
  const [inputValue, setInputValue] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [commentModalMessageId, setCommentModalMessageId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState<'up' | 'down'>('up');
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

  const openCommentModal = (messageId: string) => {
    const existingRating = feedbackGiven[messageId];
    setCommentModalMessageId(messageId);
    setCommentText('');
    setCommentRating(existingRating ?? 'up');
  };

  const handleCommentSubmit = () => {
    if (!commentModalMessageId || !commentText.trim()) {
      return;
    }
    props.onFeedbackComment?.(commentModalMessageId, commentRating, commentText.trim());
    setFeedbackGiven((prev) => ({ ...prev, [commentModalMessageId]: commentRating }));
    setCommentModalMessageId(null);
  };

  const commentModalMessage = commentModalMessageId ? props.messages.find((x) => x.id === commentModalMessageId) : null;

  const isLimitReached = props.messageCount >= props.messageLimit;
  const firstAssistantIndex = props.messages.findIndex((x) => x.role === 'assistant');
  const hasUserMessageAfterFirstAssistant =
    firstAssistantIndex !== -1 && props.messages.slice(firstAssistantIndex + 1).some((x) => x.role === 'user');
  const showFillDefaultsButton =
    firstAssistantIndex !== -1 &&
    !hasUserMessageAfterFirstAssistant &&
    props.briefStatus !== 'COMPLETED' &&
    !props.isLoading;

  const handleFillDefaults = () => {
    if (props.isLoading) {
      return;
    }
    props.onSendMessage(t('BRIEF_V2_FILL_DEFAULTS_PROMPT'));
  };

  const sectionValues = Object.values(props.sectionsStatus);
  const totalSections = sectionValues.length || 9;
  const completedSections = sectionValues.filter((x) => x === 'complete').length;
  const draftSections = sectionValues.filter((x) => x === 'draft').length;
  const progressPercent = Math.round(((completedSections + draftSections * 0.5) / totalSections) * 100);

  return (
    <ChatPanel>
      <ChatHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ChatTitle>Chat</ChatTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProgressText>
              {completedSections}/{totalSections}
            </ProgressText>
            <ChatPhase>{PHASE_LABELS[props.conversationPhase]}</ChatPhase>
          </div>
        </div>
        <ProgressBar>
          <ProgressFill $percent={progressPercent} />
        </ProgressBar>
      </ChatHeader>

      <MessagesArea>
        {props.messages.map((message, index) => (
          <div key={message.id}>
            <MessageRow $isUser={message.role === 'user'}>
              <MessageBubble $isUser={message.role === 'user'}>{message.content}</MessageBubble>
            </MessageRow>
            <MessageMeta $isUser={message.role === 'user'}>
              <MessageTime $isUser={message.role === 'user'}>{formatTime(message.createdAt)}</MessageTime>
              {message.role === 'assistant' &&
                message.sectionsChanged.length > 0 &&
                index !== firstAssistantIndex &&
                message.sectionsChanged.map((key) => (
                  <SectionBadge key={key}>{getSectionDisplayName(key)}</SectionBadge>
                ))}
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
                {props.onFeedbackComment && (
                  <FeedbackButton onClick={() => openCommentModal(message.id)}>
                    <CommentOutlined />
                  </FeedbackButton>
                )}
              </FeedbackRow>
            )}
            {index === firstAssistantIndex && showFillDefaultsButton && (
              <FeedbackRow>
                <Button size='small' type='default' onClick={handleFillDefaults}>
                  {t('BRIEF_V2_FILL_DEFAULTS_BUTTON')}
                </Button>
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
        {props.conversationPhase === 'complete' && props.briefStatus !== 'COMPLETED' && props.onFinalize ? (
          <Button
            type='primary'
            onClick={props.onFinalize}
            block
            style={{ background: '#22c55e', borderColor: '#22c55e', fontWeight: 600, height: 44 }}
          >
            {t('BRIEF_V2_FINALIZE')}
          </Button>
        ) : isLimitReached ? (
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
                disabled={props.isLoading}
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
              disabled={!inputValue.trim() || props.isLoading}
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
      {props.showRegistrationButton && props.conversationPhase === 'complete' && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <Button
            type='primary'
            onClick={props.onRegisterClick}
            block
            style={{ background: '#2288FF', borderColor: '#2288FF', fontWeight: 600, height: 44 }}
          >
            {t('BRIEF_V2_REGISTER_BUTTON')}
          </Button>
        </div>
      )}
      <Modal
        title={t('BRIEF_V2_FEEDBACK_TITLE')}
        open={commentModalMessageId != null}
        onCancel={() => setCommentModalMessageId(null)}
        onOk={handleCommentSubmit}
        okText={t('BRIEF_V2_FEEDBACK_SUBMIT')}
        cancelText={t('BRIEF_V2_FEEDBACK_CANCEL')}
        okButtonProps={{ disabled: !commentText.trim() }}
        width={400}
        destroyOnClose
      >
        <CommentModalBody>
          <CommentRatingRow>
            <CommentRatingButton $active={commentRating === 'up'} onClick={() => setCommentRating('up')}>
              <LikeOutlined />
            </CommentRatingButton>
            <CommentRatingButton $active={commentRating === 'down'} onClick={() => setCommentRating('down')}>
              <DislikeOutlined />
            </CommentRatingButton>
          </CommentRatingRow>
          <Input.TextArea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={t('BRIEF_V2_FEEDBACK_PLACEHOLDER')}
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={2000}
            showCount
            style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13 }}
          />
          {commentModalMessage && commentModalMessage.sectionsChanged.length > 0 && (
            <CommentContext>
              <span>{t('BRIEF_V2_FEEDBACK_SECTIONS')}:</span>
              {commentModalMessage.sectionsChanged.map((key) => (
                <SectionBadge key={key}>{getSectionDisplayName(key)}</SectionBadge>
              ))}
            </CommentContext>
          )}
        </CommentModalBody>
      </Modal>
    </ChatPanel>
  );
};
