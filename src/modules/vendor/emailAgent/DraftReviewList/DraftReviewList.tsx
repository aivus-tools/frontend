'use client';

import { useState } from 'react';
import { App, Button, Card, Empty, Input, Popconfirm, Space, Tag } from 'antd';
import { t } from '@/lib/i18n';
import {
  useApproveDraftMutation,
  useEditDraftMutation,
  useGetDraftsQuery,
  useRejectDraftMutation,
} from '@/services/client/emailAgentApi';
import { OutboundDraftDto } from '@/types/emailAgent.interface';
import { PageSpinner } from '@/components/PageSpinner';
import { draftKindLabel, getBackendErrorMessage } from '../helpers';

import styles from './DraftReviewList.module.css';

interface DraftCardProps {
  draft: OutboundDraftDto;
}

const DraftCard = (props: DraftCardProps) => {
  const { draft } = props;
  const { message } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(draft.body);
  const [approveDraft, approveState] = useApproveDraftMutation();
  const [editDraft, editState] = useEditDraftMutation();
  const [rejectDraft, rejectState] = useRejectDraftMutation();

  const failure = (error: unknown) => {
    message.error(getBackendErrorMessage(error) ?? t('EMAIL_AGENT_DRAFT_ACTION_FAILED'));
  };

  const handleApprove = async () => {
    try {
      await approveDraft({ draftId: draft.id }).unwrap();
      message.success(t('EMAIL_AGENT_APPROVED_OK'));
    } catch (error) {
      failure(error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await editDraft({ draftId: draft.id, body }).unwrap();
      message.success(t('EMAIL_AGENT_EDIT_SAVED_OK'));
      setIsEditing(false);
    } catch (error) {
      failure(error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectDraft(draft.id).unwrap();
      message.success(t('EMAIL_AGENT_REJECTED_OK'));
    } catch (error) {
      failure(error);
    }
  };

  return (
    <Card className={styles.card} size='small'>
      <div className={styles.header}>
        <Tag color='blue'>{draftKindLabel(draft.kind)}</Tag>
        {draft.overdue && <Tag color='orange'>{t('EMAIL_AGENT_DRAFT_OVERDUE')}</Tag>}
      </div>

      {isEditing ? (
        <Input.TextArea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          autoSize={{ minRows: 4, maxRows: 16 }}
          className={styles.editor}
        />
      ) : (
        <p className={styles.body}>{draft.body}</p>
      )}

      <div className={styles.actions}>
        {isEditing ? (
          <Space wrap>
            <Button type='primary' loading={editState.isLoading} onClick={handleSaveEdit}>
              {t('EMAIL_AGENT_SAVE_EDIT')}
            </Button>
            <Button
              onClick={() => {
                setBody(draft.body);
                setIsEditing(false);
              }}
            >
              {t('EMAIL_AGENT_CANCEL')}
            </Button>
          </Space>
        ) : (
          <Space wrap>
            <Button type='primary' loading={approveState.isLoading} onClick={handleApprove}>
              {t('EMAIL_AGENT_APPROVE')}
            </Button>
            <Button onClick={() => setIsEditing(true)}>{t('EMAIL_AGENT_EDIT')}</Button>
            <Popconfirm
              title={t('EMAIL_AGENT_REJECT')}
              okText={t('EMAIL_AGENT_REJECT')}
              cancelText={t('EMAIL_AGENT_CANCEL')}
              onConfirm={handleReject}
            >
              <Button danger loading={rejectState.isLoading}>
                {t('EMAIL_AGENT_REJECT')}
              </Button>
            </Popconfirm>
          </Space>
        )}
      </div>
    </Card>
  );
};

export const DraftReviewList = () => {
  const { data, isLoading } = useGetDraftsQuery();
  const drafts = data?.drafts ?? [];

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('EMAIL_AGENT_DRAFTS_TITLE')}</h2>
      {drafts.length === 0 ? (
        <Empty description={t('EMAIL_AGENT_DRAFTS_EMPTY')} />
      ) : (
        <div className={styles.list}>
          {drafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
};
