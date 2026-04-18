'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Modal } from 'antd';
import { SendOutlined, LikeOutlined, DislikeOutlined, CommentOutlined, CodeOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { LLMTraceDrawer } from './LLMTraceDrawer';
import { FileUploadZone } from '@/modules/client/BriefEditorV2/components/FileUploadZone';
import { t } from '@/lib/i18n';
import { BriefAttachment, ChatMessageV3, ConversationStatus } from '@/types/briefAi.interface';
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
  briefId?: string;
  messages: ChatMessageV3[];
  conversationStatus: ConversationStatus;
  isLoading: boolean;
  messageLimit: number;
  messageCount: number;
  totalCostUsd?: string;
  pendingAttachments: BriefAttachment[];
  uploading: boolean;
  maxAttachments: number;
  onUploadAttachment: (file: File) => Promise<void> | void;
  onDeleteAttachment: (attachmentId: string) => Promise<void> | void;
  onSendMessage: (message: string, attachmentIds: string[]) => void;
  onFeedback: ((messageId: string, rating: 'up' | 'down') => void) | null;
  onFeedbackComment: ((messageId: string, rating: 'up' | 'down', comment: string) => void) | null;
  onFinalize: (() => void) | null;
  onShowPackage?: (() => void) | null;
  showRegistrationButton?: boolean;
  onRegisterClick?: () => void;
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  in_progress: 'In progress',
  ready_to_finalize: 'Ready to finalize',
  finalized: 'Finalized',
};

const formatTime = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const BriefChatPanel: React.FC<BriefChatPanelProps> = (props) => {
  const { data: session } = useSession();
  const isStaff = Boolean((session?.user as { isStaff?: boolean } | undefined)?.isStaff);

  const [draft, setDraft] = useState('');
  const [traceMessageId, setTraceMessageId] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<{
    messageId: string;
    content: string;
    rating: 'up' | 'down';
    comment: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [props.messages.length]);

  const pendingIds = props.pendingAttachments.map((x) => x.id);

  const limitReached = props.messageCount >= props.messageLimit;
  const canSend = draft.trim().length > 0 && !props.isLoading && !props.uploading && !limitReached;

  const handleSend = useCallback(() => {
    if (!canSend) {
      return;
    }
    const text = draft.trim();
    props.onSendMessage(text, pendingIds);
    setDraft('');
  }, [canSend, draft, pendingIds, props]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const openCommentModal = (messageId: string, content: string, rating: 'up' | 'down') => {
    setCommentModal({ messageId, content, rating, comment: '' });
  };

  const submitComment = () => {
    if (!commentModal || !props.onFeedbackComment) {
      return;
    }
    props.onFeedbackComment(commentModal.messageId, commentModal.rating, commentModal.comment.trim());
    setCommentModal(null);
  };

  return (
    <ChatPanel>
      <ChatHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ChatTitle>{t('BRIEF_V3_CHAT_TITLE')}</ChatTitle>
          <ChatPhase>{STATUS_LABELS[props.conversationStatus]}</ChatPhase>
        </div>
        {isStaff && props.totalCostUsd ? (
          <div style={{ fontSize: 11, color: '#99a1b7', marginTop: 4 }}>cost: ${props.totalCostUsd}</div>
        ) : null}
      </ChatHeader>

      <MessagesArea>
        {props.messages.map((message) => {
          const isUser = message.role === 'user';
          const feedback = message.feedback;
          return (
            <MessageRow key={message.id} $isUser={isUser}>
              <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <MessageBubble $isUser={isUser}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </MessageBubble>

                {!isUser && message.attachments?.length > 0 ? (
                  <div style={{ fontSize: 11, color: '#99a1b7' }}>
                    {message.attachments.length} {t('BRIEF_V3_ATTACHMENTS')}
                  </div>
                ) : null}

                <MessageMeta $isUser={isUser}>
                  <MessageTime $isUser={isUser}>{formatTime(message.createdAt)}</MessageTime>
                  {!isUser && props.onFeedback ? (
                    <FeedbackRow>
                      <FeedbackButton
                        $active={feedback?.rating === 'up'}
                        onClick={() => props.onFeedback?.(message.id, 'up')}
                      >
                        <LikeOutlined />
                      </FeedbackButton>
                      <FeedbackButton
                        $active={feedback?.rating === 'down'}
                        onClick={() => props.onFeedback?.(message.id, 'down')}
                      >
                        <DislikeOutlined />
                      </FeedbackButton>
                      {props.onFeedbackComment ? (
                        <FeedbackButton
                          onClick={() => openCommentModal(message.id, message.content, feedback?.rating ?? 'up')}
                        >
                          <CommentOutlined />
                        </FeedbackButton>
                      ) : null}
                      {isStaff && message.hasTrace ? (
                        <FeedbackButton onClick={() => setTraceMessageId(message.id)}>
                          <CodeOutlined />
                        </FeedbackButton>
                      ) : null}
                    </FeedbackRow>
                  ) : null}
                </MessageMeta>
              </div>
            </MessageRow>
          );
        })}

        {props.isLoading ? (
          <TypingIndicator>
            <TypingDot $delay={0} />
            <TypingDot $delay={200} />
            <TypingDot $delay={400} />
          </TypingIndicator>
        ) : null}

        <div ref={messagesEndRef} />
      </MessagesArea>

      {props.conversationStatus === 'ready_to_finalize' && props.onFinalize ? (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #eef0f4',
            background: '#f0fdf4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: '#16a34a' }}>{t('BRIEF_V3_READY_TO_FINALIZE')}</span>
          <Button type='primary' onClick={props.onFinalize}>
            {t('BRIEF_V3_FINALIZE')}
          </Button>
        </div>
      ) : null}

      {props.conversationStatus === 'finalized' && props.onShowPackage ? (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #eef0f4',
            background: '#eff6ff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Button type='primary' onClick={props.onShowPackage}>
            {t('BRIEF_V3_SHOW_PACKAGE')}
          </Button>
        </div>
      ) : null}

      {props.showRegistrationButton && props.onRegisterClick ? (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #eef0f4',
            background: '#fffbea',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: '#a16207' }}>{t('BRIEF_V3_REGISTER_TO_SAVE')}</span>
          <Button type='primary' onClick={props.onRegisterClick}>
            {t('BRIEF_V3_REGISTER')}
          </Button>
        </div>
      ) : null}

      <InputArea>
        <FileUploadZone
          attachments={props.pendingAttachments}
          uploading={props.uploading}
          maxFiles={props.maxAttachments}
          onUpload={props.onUploadAttachment}
          onDelete={props.onDeleteAttachment}
          disabled={limitReached}
        />

        <ChatInputWrapper>
          <TextArea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('BRIEF_V3_CHAT_PLACEHOLDER')}
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={limitReached || props.isLoading}
          />
          <Button type='primary' icon={<SendOutlined />} disabled={!canSend} onClick={handleSend}>
            {t('SEND')}
          </Button>
        </ChatInputWrapper>

        {Number.isFinite(props.messageLimit) ? (
          <LimitBadge>
            {props.messageCount}/{props.messageLimit} {t('BRIEF_V3_MESSAGES')}
          </LimitBadge>
        ) : null}
      </InputArea>

      {commentModal ? (
        <Modal
          open
          title={t('BRIEF_V3_FEEDBACK_TITLE')}
          onCancel={() => setCommentModal(null)}
          onOk={submitComment}
          okText={t('BRIEF_V3_FEEDBACK_SUBMIT')}
          cancelText={t('CANCEL')}
        >
          <CommentModalBody>
            <CommentContext>{commentModal.content}</CommentContext>
            <CommentRatingRow>
              <CommentRatingButton
                $active={commentModal.rating === 'up'}
                onClick={() => setCommentModal({ ...commentModal, rating: 'up' })}
              >
                <LikeOutlined />
              </CommentRatingButton>
              <CommentRatingButton
                $active={commentModal.rating === 'down'}
                onClick={() => setCommentModal({ ...commentModal, rating: 'down' })}
              >
                <DislikeOutlined />
              </CommentRatingButton>
            </CommentRatingRow>
            <TextArea
              value={commentModal.comment}
              onChange={(event) => setCommentModal({ ...commentModal, comment: event.target.value })}
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              placeholder={t('BRIEF_V3_FEEDBACK_PLACEHOLDER')}
            />
          </CommentModalBody>
        </Modal>
      ) : null}

      {props.briefId ? (
        <LLMTraceDrawer
          briefId={props.briefId}
          messageId={traceMessageId}
          open={traceMessageId !== null}
          onClose={() => setTraceMessageId(null)}
        />
      ) : null}
    </ChatPanel>
  );
};
