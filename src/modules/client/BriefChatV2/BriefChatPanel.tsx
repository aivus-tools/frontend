'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { App, Button, Input, Modal } from 'antd';
import {
  SendOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  CodeOutlined,
  FileOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { LLMTraceDrawer } from './LLMTraceDrawer';
import { FileUploadZone } from '@/modules/client/BriefEditorV2/components/FileUploadZone';
import { t } from '@/lib/i18n';
import { BriefAttachment, ChatMessageV3, ConversationStatus } from '@/types/briefAi.interface';
import {
  ChatPanel,
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
  ChatFooterRow,
  LimitBadge,
  CostBadge,
  DropOverlay,
  AttachmentChipList,
  AttachmentChip,
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
  showCost?: boolean;
  pendingAttachments: BriefAttachment[];
  uploading: boolean;
  maxAttachments: number;
  onUploadAttachment: (file: File) => Promise<void> | void;
  onDeleteAttachment: (attachmentId: string) => Promise<void> | void;
  onSendMessage: (message: string, attachmentIds: string[]) => void;
  onFeedback: ((messageId: string, rating: 'up' | 'down') => void) | null;
  onFeedbackComment: ((messageId: string, rating: 'up' | 'down', comment: string) => void) | null;
  onFinalize: (() => void) | null;
  onRegenerate?: (() => void) | null;
  isRegenerating?: boolean;
  onShowPackage?: (() => void) | null;
  showRegistrationButton?: boolean;
  onRegisterClick?: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentChipsRow: React.FC<{ attachments: BriefAttachment[] }> = ({ attachments }) => {
  if (!attachments?.length) return null;
  return (
    <AttachmentChipList>
      {attachments.map((x) => (
        <AttachmentChip
          key={x.id}
          href={x.url ?? undefined}
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e) => {
            if (!x.url) {
              e.preventDefault();
            }
          }}
        >
          <FileOutlined />
          <span className='name'>{x.filename}</span>
          <span>· {formatBytes(x.sizeBytes)}</span>
        </AttachmentChip>
      ))}
    </AttachmentChipList>
  );
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
  const { modal } = App.useApp();

  const [draft, setDraft] = useState('');
  const [traceMessageId, setTraceMessageId] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<{
    messageId: string;
    content: string;
    rating: 'up' | 'down';
    comment: string;
  } | null>(null);
  const [showAttachBox, setShowAttachBox] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesAreaRef.current;
    if (!el) {
      return;
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current) {
      return;
    }
    const el = messagesAreaRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [props.messages.length, props.isLoading]);

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

  const handleDropFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      try {
        await props.onUploadAttachment(file);
      } catch {
        // FileUploadZone already logs/displays errors; avoid duplicates here.
      }
    }
  };

  return (
    <ChatPanel
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files?.length) {
          handleDropFiles(event.dataTransfer.files);
        }
      }}
    >
      <MessagesArea ref={messagesAreaRef} onScroll={handleMessagesScroll}>
        {props.messages.map((message) => {
          const isUser = message.role === 'user';
          const feedback = message.feedback;
          const isMetaMessage = message.kind === 'feedback_request' || message.kind === 'feedback_reply_ack';
          return (
            <MessageRow key={message.id} $isUser={isUser}>
              <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <MessageBubble $isUser={isUser}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </MessageBubble>

                {message.attachments?.length > 0 ? <AttachmentChipsRow attachments={message.attachments} /> : null}

                <MessageMeta $isUser={isUser}>
                  <MessageTime $isUser={isUser}>{formatTime(message.createdAt)}</MessageTime>
                  {!isUser && !isMetaMessage && props.onFeedback ? (
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
          <Button
            type='primary'
            onClick={() => {
              const confirmCallback = props.onFinalize;
              if (!confirmCallback) {
                return;
              }
              modal.confirm({
                title: t('BRIEF_V3_FINALIZE_CONFIRM_TITLE'),
                content: t('BRIEF_V3_FINALIZE_CONFIRM_BODY'),
                okText: t('BRIEF_V3_FINALIZE_CONFIRM_OK'),
                cancelText: t('BRIEF_V3_FINALIZE_CONFIRM_CANCEL'),
                okButtonProps: { type: 'primary' },
                onOk: confirmCallback,
              });
            }}
          >
            {t('BRIEF_V3_FINALIZE')}
          </Button>
        </div>
      ) : null}

      {props.conversationStatus === 'finalized' && (props.onRegenerate || props.onShowPackage) ? (
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
          {props.onRegenerate ? (
            <Button
              loading={Boolean(props.isRegenerating)}
              onClick={() => {
                const regen = props.onRegenerate;
                if (!regen) {
                  return;
                }
                modal.confirm({
                  title: t('BRIEF_V3_REGENERATE_CONFIRM_TITLE'),
                  content: t('BRIEF_V3_REGENERATE_CONFIRM_BODY'),
                  okText: t('BRIEF_V3_REGENERATE_CONFIRM_OK'),
                  cancelText: t('BRIEF_V3_FINALIZE_CONFIRM_CANCEL'),
                  okButtonProps: { type: 'primary' },
                  onOk: regen,
                });
              }}
            >
              {t('BRIEF_V3_REGENERATE_PACKAGE')}
            </Button>
          ) : null}
          {props.onShowPackage ? (
            <Button type='primary' onClick={props.onShowPackage}>
              {t('BRIEF_V3_SHOW_PACKAGE')}
            </Button>
          ) : null}
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

        {showAttachBox || props.pendingAttachments.length > 0 ? (
          <FileUploadZone
            attachments={props.pendingAttachments}
            uploading={props.uploading}
            maxFiles={props.maxAttachments}
            onUpload={props.onUploadAttachment}
            onDelete={props.onDeleteAttachment}
            disabled={limitReached}
          />
        ) : null}

        <ChatFooterRow>
          <button
            type='button'
            onClick={() => setShowAttachBox((x) => !x)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              border: '1px solid #eef0f4',
              borderRadius: 6,
              background: '#ffffff',
              color: '#4b5675',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <PaperClipOutlined />
            {showAttachBox ? t('BRIEF_V3_ATTACH_HIDE') : t('BRIEF_V3_ATTACH_SHOW')}
          </button>

          {(props.showCost || isStaff) && props.totalCostUsd ? (
            <CostBadge $staff={isStaff}>
              {t('BRIEF_V3_COST_BADGE')}: ${Number(props.totalCostUsd).toFixed(4)}
            </CostBadge>
          ) : null}

          {Number.isFinite(props.messageLimit) ? (
            <LimitBadge>
              {props.messageCount}/{props.messageLimit} {t('BRIEF_V3_MESSAGES')}
            </LimitBadge>
          ) : null}

          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#99a1b7' }}>{t('BRIEF_V3_DRAG_HINT')}</span>
        </ChatFooterRow>
      </InputArea>

      {isDragging ? <DropOverlay>{t('BRIEF_V3_DROP_HERE')}</DropOverlay> : null}

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
