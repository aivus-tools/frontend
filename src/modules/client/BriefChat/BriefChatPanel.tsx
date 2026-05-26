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
import { VoiceRecorderButton } from './VoiceRecorderButton';
import { FileUploadZone } from '@/modules/client/BriefEditor/components/FileUploadZone';
import { t } from '@/lib/i18n';
import { BriefAttachment, ChatMessageV3, ConversationStatus } from '@/types/briefAi.interface';

import styles from './BriefChatPanel.module.css';

const TextArea = Input.TextArea;

interface BriefChatPanelProps {
  briefId?: string;
  isPublic: boolean;
  publicToken: string | null;
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
  onRegenerate?: (() => void) | null;
  isRegenerating?: boolean;
  onShowPackage?: (() => void) | null;
  showRegistrationButton?: boolean;
  onRegisterClick?: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface AttachmentChipsRowProps {
  attachments: BriefAttachment[];
}

const AttachmentChipsRow = (props: AttachmentChipsRowProps) => {
  if (!props.attachments?.length) {
    return null;
  }
  return (
    <div className={styles.attachmentChipList}>
      {props.attachments.map((x) => (
        <a
          key={x.id}
          className={styles.attachmentChip}
          href={x.url ?? undefined}
          target='_blank'
          rel='noopener noreferrer'
          onClick={(event) => {
            if (!x.url) {
              event.preventDefault();
            }
          }}
        >
          <FileOutlined />
          <span className='name'>{x.filename}</span>
          <span>· {formatBytes(x.sizeBytes)}</span>
        </a>
      ))}
    </div>
  );
};

const formatTime = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const messageRowClass = (isUser: boolean): string => {
  return isUser ? `${styles.messageRow} ${styles.messageRowUser}` : styles.messageRow;
};

const messageBubbleClass = (isUser: boolean): string => {
  return isUser ? `${styles.messageBubble} ${styles.messageBubbleUser}` : styles.messageBubble;
};

const messageMetaClass = (isUser: boolean): string => {
  return isUser ? `${styles.messageMeta} ${styles.messageMetaUser}` : styles.messageMeta;
};

const messageTimeClass = (isUser: boolean): string => {
  return isUser ? `${styles.messageTime} ${styles.messageTimeUser}` : styles.messageTime;
};

const feedbackButtonClass = (active: boolean): string => {
  return active ? `${styles.feedbackButton} ${styles.feedbackButtonActive}` : styles.feedbackButton;
};

const commentRatingButtonClass = (active: boolean): string => {
  return active ? `${styles.commentRatingButton} ${styles.commentRatingButtonActive}` : styles.commentRatingButton;
};

export const BriefChatPanel = (props: BriefChatPanelProps) => {
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
  const [isVoiceBusy, setIsVoiceBusy] = useState(false);

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
  const canSend = draft.trim().length > 0 && !props.isLoading && !props.uploading && !limitReached && !isVoiceBusy;

  const appendToDraft = useCallback((text: string) => {
    if (!text) {
      return;
    }
    setDraft((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${text}` : text));
  }, []);

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
        void file;
      }
    }
  };

  return (
    <div
      className={styles.chatPanel}
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
      <div className={styles.messagesArea} ref={messagesAreaRef} onScroll={handleMessagesScroll}>
        {props.messages.map((message) => {
          const isUser = message.role === 'user';
          const feedback = message.feedback;
          const isMetaMessage = message.kind === 'feedback_request' || message.kind === 'feedback_reply_ack';
          return (
            <div key={message.id} className={messageRowClass(isUser)}>
              <div className={styles.messageColumn}>
                <div className={messageBubbleClass(isUser)}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {message.attachments?.length > 0 ? <AttachmentChipsRow attachments={message.attachments} /> : null}

                <div className={messageMetaClass(isUser)}>
                  <span className={messageTimeClass(isUser)}>{formatTime(message.createdAt)}</span>
                  {!isUser && !isMetaMessage && props.onFeedback ? (
                    <div className={styles.feedbackRow}>
                      <button
                        type='button'
                        className={feedbackButtonClass(feedback?.rating === 'up')}
                        onClick={() => props.onFeedback?.(message.id, 'up')}
                      >
                        <LikeOutlined />
                      </button>
                      <button
                        type='button'
                        className={feedbackButtonClass(feedback?.rating === 'down')}
                        onClick={() => props.onFeedback?.(message.id, 'down')}
                      >
                        <DislikeOutlined />
                      </button>
                      {props.onFeedbackComment ? (
                        <button
                          type='button'
                          className={styles.feedbackButton}
                          onClick={() => openCommentModal(message.id, message.content, feedback?.rating ?? 'up')}
                        >
                          <CommentOutlined />
                        </button>
                      ) : null}
                      {isStaff && message.hasTrace ? (
                        <button
                          type='button'
                          className={styles.feedbackButton}
                          onClick={() => setTraceMessageId(message.id)}
                        >
                          <CodeOutlined />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {props.isLoading ? (
          <div className={styles.typingIndicator}>
            <span className={styles.typingDot} style={{ '--typing-dot-delay': '0ms' } as React.CSSProperties} />
            <span className={styles.typingDot} style={{ '--typing-dot-delay': '200ms' } as React.CSSProperties} />
            <span className={styles.typingDot} style={{ '--typing-dot-delay': '400ms' } as React.CSSProperties} />
          </div>
        ) : null}
      </div>

      {props.conversationStatus === 'finalized' && (props.onRegenerate || props.onShowPackage) ? (
        <div className={`${styles.statusBar} ${styles.statusBarFinalized}`}>
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
                  cancelText: t('CANCEL'),
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
        <div className={`${styles.statusBar} ${styles.statusBarRegister}`}>
          <span className={`${styles.statusBarText} ${styles.statusBarTextRegister}`}>
            {t('BRIEF_V3_REGISTER_TO_SAVE')}
          </span>
          <Button type='primary' onClick={props.onRegisterClick}>
            {t('BRIEF_V3_REGISTER')}
          </Button>
        </div>
      ) : null}

      <div className={styles.inputArea}>
        <div className={styles.chatInputWrapper}>
          <TextArea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('BRIEF_V3_CHAT_PLACEHOLDER')}
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={limitReached || props.isLoading || isVoiceBusy}
          />
          {props.briefId ? (
            <VoiceRecorderButton
              briefId={props.briefId}
              isPublic={props.isPublic}
              publicToken={props.publicToken}
              disabled={limitReached || props.isLoading}
              onTranscript={appendToDraft}
              onBusyChange={setIsVoiceBusy}
            />
          ) : null}
          <Button type='primary' icon={<SendOutlined />} disabled={!canSend} onClick={handleSend}>
            {t('SEND')}
          </Button>
        </div>

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

        <div className={styles.chatFooterRow}>
          <button type='button' className={styles.attachToggle} onClick={() => setShowAttachBox((x) => !x)}>
            <PaperClipOutlined />
            {showAttachBox ? t('BRIEF_V3_ATTACH_HIDE') : t('BRIEF_V3_ATTACH_SHOW')}
          </button>

          {(props.showCost || isStaff) && props.totalCostUsd ? (
            <span className={isStaff ? `${styles.costBadge} ${styles.costBadgeStaff}` : styles.costBadge}>
              {t('BRIEF_V3_COST_BADGE')}: ${Number(props.totalCostUsd).toFixed(4)}
            </span>
          ) : null}

          {Number.isFinite(props.messageLimit) ? (
            <span className={styles.limitBadge}>
              {props.messageCount}/{props.messageLimit} {t('BRIEF_V3_MESSAGES')}
            </span>
          ) : null}

          <span className={styles.dragHint}>{t('BRIEF_V3_DRAG_HINT')}</span>
        </div>
      </div>

      {isDragging ? <div className={styles.dropOverlay}>{t('BRIEF_V3_DROP_HERE')}</div> : null}

      {commentModal ? (
        <Modal
          open
          title={t('BRIEF_V3_FEEDBACK_TITLE')}
          onCancel={() => setCommentModal(null)}
          onOk={submitComment}
          okText={t('BRIEF_V3_FEEDBACK_SUBMIT')}
          cancelText={t('CANCEL')}
          width='min(520px, calc(100vw - 24px))'
          centered
        >
          <div className={styles.commentModalBody}>
            <div className={styles.commentContext}>{commentModal.content}</div>
            <div className={styles.commentRatingRow}>
              <button
                type='button'
                className={commentRatingButtonClass(commentModal.rating === 'up')}
                onClick={() => setCommentModal({ ...commentModal, rating: 'up' })}
              >
                <LikeOutlined />
              </button>
              <button
                type='button'
                className={commentRatingButtonClass(commentModal.rating === 'down')}
                onClick={() => setCommentModal({ ...commentModal, rating: 'down' })}
              >
                <DislikeOutlined />
              </button>
            </div>
            <TextArea
              value={commentModal.comment}
              onChange={(event) => setCommentModal({ ...commentModal, comment: event.target.value })}
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              placeholder={t('BRIEF_V3_FEEDBACK_PLACEHOLDER')}
            />
          </div>
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
    </div>
  );
};
