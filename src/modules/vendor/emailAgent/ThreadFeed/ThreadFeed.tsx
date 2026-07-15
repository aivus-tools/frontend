'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Empty, Tag } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import { useGetThreadsQuery } from '@/services/client/emailAgentApi';
import { ThreadSummary } from '@/types/emailAgent.interface';
import { PageSpinner } from '@/components/PageSpinner';
import { formatDate, threadStateColor, threadStateLabel } from '../helpers';

import styles from './ThreadFeed.module.css';

const PAGE_SIZE = 25;

interface ThreadCardProps {
  thread: ThreadSummary;
  onOpen: (threadId: string) => void;
}

const ThreadCard = (props: ThreadCardProps) => {
  const { thread } = props;
  return (
    <Card hoverable className={styles.card} onClick={() => props.onOpen(thread.threadId)}>
      <div className={styles.cardHeader}>
        <span className={styles.subject}>{thread.subject || thread.clientEmail || '—'}</span>
        <div className={styles.tags}>
          {thread.needsAction && <Tag color='red'>{t('EMAIL_AGENT_NEEDS_ACTION')}</Tag>}
          <Tag color={threadStateColor(thread.state)}>{threadStateLabel(thread.state)}</Tag>
        </div>
      </div>
      <div className={styles.client}>{thread.clientName || thread.clientEmail}</div>
      <div className={styles.footer}>
        <div className={styles.chips}>
          {thread.pendingDraftCount > 0 && (
            <span className={styles.chip}>{t('EMAIL_AGENT_PENDING_DRAFTS', String(thread.pendingDraftCount))}</span>
          )}
          {thread.overdueItemCount > 0 && (
            <span className={styles.chipDanger}>{t('EMAIL_AGENT_OVERDUE_ITEMS', String(thread.overdueItemCount))}</span>
          )}
          {thread.openItemCount > 0 && (
            <span className={styles.chip}>{t('EMAIL_AGENT_OPEN_ITEMS', String(thread.openItemCount))}</span>
          )}
        </div>
        <span className={styles.date}>{formatDate(thread.lastActivityAt)}</span>
      </div>
    </Card>
  );
};

const mergeUnique = (existing: ThreadSummary[], incoming: ThreadSummary[]): ThreadSummary[] => {
  const seen = new Set(existing.map((thread) => thread.threadId));
  return [...existing, ...incoming.filter((thread) => !seen.has(thread.threadId))];
};

export const ThreadFeed = () => {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ThreadSummary[]>([]);
  const { data, isLoading, isFetching } = useGetThreadsQuery({ limit: PAGE_SIZE, offset });

  useEffect(() => {
    if (!data) {
      return;
    }
    setItems((prev) => (offset === 0 ? data.threads : mergeUnique(prev, data.threads)));
  }, [data, offset]);

  const handleOpen = (threadId: string) => {
    router.push(AppRoute.EMAIL_AGENT_THREAD(threadId));
  };

  const handleLoadMore = () => {
    setOffset(offset + PAGE_SIZE);
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (data?.total === 0) {
    return <Empty image={<InboxOutlined className={styles.emptyIcon} />} description={t('EMAIL_AGENT_FEED_EMPTY')} />;
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{t('EMAIL_AGENT_FEED_TITLE')}</h1>
      <div className={styles.list}>
        {items.map((thread) => (
          <ThreadCard key={thread.threadId} thread={thread} onOpen={handleOpen} />
        ))}
      </div>
      {data?.hasMore && (
        <div className={styles.loadMore}>
          <Button onClick={handleLoadMore} loading={isFetching} size='large'>
            {t('EMAIL_AGENT_LOAD_MORE')}
          </Button>
        </div>
      )}
    </div>
  );
};
