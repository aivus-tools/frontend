'use client';

import { useRouter } from 'next/navigation';
import { App, Button, Card, Empty, Tag } from 'antd';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import { useGetFollowupsQuery, usePrepareFollowupMutation } from '@/services/client/emailAgentApi';
import { FollowupItem } from '@/types/emailAgent.interface';
import { PageSpinner } from '@/components/PageSpinner';
import { followupKindColor, followupKindLabel, getBackendErrorMessage } from '../helpers';

import styles from './FollowupDashboard.module.css';

interface FollowupCardProps {
  item: FollowupItem;
  onOpen: (threadId: string) => void;
}

const FollowupCard = (props: FollowupCardProps) => {
  const { item } = props;
  const { message } = App.useApp();
  const [prepareFollowup, { isLoading }] = usePrepareFollowupMutation();

  const handlePrepare = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await prepareFollowup(item.threadId).unwrap();
      message.success(t('EMAIL_AGENT_PREPARE_FOLLOWUP_OK'));
    } catch (error) {
      message.error(getBackendErrorMessage(error) ?? t('EMAIL_AGENT_PREPARE_FOLLOWUP_FAILED'));
    }
  };

  return (
    <Card hoverable className={styles.card} size='small' onClick={() => props.onOpen(item.threadId)}>
      <div className={styles.header}>
        <Tag color={followupKindColor(item.kind)}>{followupKindLabel(item.kind)}</Tag>
      </div>
      <div className={styles.subject}>{item.subject || item.clientEmail || '—'}</div>
      <div className={styles.client}>{item.clientEmail}</div>
      <div className={styles.detail}>{item.detail}</div>
      {item.kind === 'overdue_promise' && (
        <div className={styles.action}>
          <Button type='primary' size='small' loading={isLoading} onClick={handlePrepare}>
            {t('EMAIL_AGENT_PREPARE_FOLLOWUP')}
          </Button>
        </div>
      )}
    </Card>
  );
};

export const FollowupDashboard = () => {
  const router = useRouter();
  const { data, isLoading } = useGetFollowupsQuery();
  const followups = data?.followups ?? [];

  const handleOpen = (threadId: string) => {
    router.push(AppRoute.EMAIL_AGENT_THREAD(threadId));
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('EMAIL_AGENT_FOLLOWUPS_TITLE')}</h2>
      {followups.length === 0 ? (
        <Empty description={t('EMAIL_AGENT_FOLLOWUPS_EMPTY')} />
      ) : (
        <div className={styles.list}>
          {followups.map((item, index) => (
            <FollowupCard key={`${item.kind}-${item.threadId}-${index}`} item={item} onOpen={handleOpen} />
          ))}
        </div>
      )}
    </div>
  );
};
