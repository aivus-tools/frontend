'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Empty, Tag } from 'antd';
import { CaretDownOutlined, CaretRightOutlined, InboxOutlined } from '@ant-design/icons';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import { useGetThreadsQuery } from '@/services/client/emailAgentApi';
import { ThreadSummary } from '@/types/emailAgent.interface';
import { PageSpinner } from '@/components/PageSpinner';
import { formatDate, formatDateTime, threadStateColor, threadStateLabel } from '../helpers';

import styles from './ThreadFeed.module.css';

const PAGE_SIZE = 25;

interface FeedGroup {
  kind: 'row' | 'collapsed';
  items: ThreadSummary[];
}

interface ThreadRowProps {
  thread: ThreadSummary;
  onOpen: (threadId: string) => void;
}

const previewFromLine = (thread: ThreadSummary): string => {
  const raw = (thread.lastMessagePreview || '').replace(/\s+/g, ' ').trim();
  if (!raw) {
    return '';
  }
  if (thread.lastMessageDirection === 'out') {
    return `${t('EMAIL_AGENT_THREAD_YOU_PREFIX')} ${raw}`;
  }
  return raw;
};

const senderOf = (thread: ThreadSummary): string => thread.clientName || thread.clientEmail || '—';

const ThreadRow = (props: ThreadRowProps) => {
  const { thread } = props;
  const sender = senderOf(thread);
  const preview = previewFromLine(thread);
  const timestamp = thread.lastMessageAt || thread.lastActivityAt;
  return (
    <button
      type='button'
      className={`${styles.row} ${thread.needsAction ? styles.rowNeedsAction : ''}`}
      onClick={() => props.onOpen(thread.threadId)}
    >
      <span className={styles.rowIndicator} aria-hidden />
      <span className={styles.rowSender}>{sender}</span>
      <span className={styles.rowContent}>
        <span className={styles.rowSubject}>{thread.subject || t('EMAIL_AGENT_NO_SUBJECT')}</span>
        {preview && (
          <>
            <span className={styles.rowSeparator}> — </span>
            <span className={styles.rowPreview}>{preview}</span>
          </>
        )}
      </span>
      <span className={styles.rowMeta}>
        {thread.pendingDraftCount > 0 && (
          <Tag color='blue' bordered={false} className={styles.metaTag}>
            {t('EMAIL_AGENT_PENDING_DRAFTS', String(thread.pendingDraftCount))}
          </Tag>
        )}
        {thread.overdueItemCount > 0 && (
          <Tag color='red' bordered={false} className={styles.metaTag}>
            {t('EMAIL_AGENT_OVERDUE_ITEMS', String(thread.overdueItemCount))}
          </Tag>
        )}
        {thread.state !== 'engaged' && thread.state !== 'monitoring' && (
          <Tag color={threadStateColor(thread.state)} bordered={false} className={styles.metaTag}>
            {threadStateLabel(thread.state)}
          </Tag>
        )}
        <span className={styles.rowDate} title={formatDate(timestamp)}>
          {formatDateTime(timestamp)}
        </span>
      </span>
    </button>
  );
};

interface CollapsedGroupProps {
  threads: ThreadSummary[];
  onOpen: (threadId: string) => void;
}

const MAX_SENDERS_IN_HEADER = 4;

const CollapsedGroup = (props: CollapsedGroupProps) => {
  const [expanded, setExpanded] = useState(false);
  const { threads } = props;
  const senders = threads.slice(0, MAX_SENDERS_IN_HEADER).map(senderOf);
  const rest = Math.max(0, threads.length - senders.length);
  const label = t('EMAIL_AGENT_QUIET_GROUP', String(threads.length));

  return (
    <div className={styles.group}>
      <button
        type='button'
        className={styles.groupHeader}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={styles.groupCaret} aria-hidden>
          {expanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </span>
        <span className={styles.groupCount}>{label}</span>
        <span className={styles.groupSenders}>
          {senders.join(' • ')}
          {rest > 0 && ` +${rest}`}
        </span>
      </button>
      {expanded && (
        <div className={styles.groupBody}>
          {threads.map((thread) => (
            <ThreadRow key={thread.threadId} thread={thread} onOpen={props.onOpen} />
          ))}
        </div>
      )}
    </div>
  );
};

const buildGroups = (items: ThreadSummary[]): FeedGroup[] => {
  const groups: FeedGroup[] = [];
  let buffer: ThreadSummary[] = [];
  const flushBuffer = () => {
    if (buffer.length === 0) {
      return;
    }
    if (buffer.length === 1) {
      groups.push({ kind: 'row', items: buffer });
    } else {
      groups.push({ kind: 'collapsed', items: buffer });
    }
    buffer = [];
  };
  for (const thread of items) {
    if (thread.needsAction) {
      flushBuffer();
      groups.push({ kind: 'row', items: [thread] });
    } else {
      buffer.push(thread);
    }
  }
  flushBuffer();
  return groups;
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

  const groups = useMemo(() => buildGroups(items), [items]);

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
        {groups.map((group, index) => {
          if (group.kind === 'row') {
            const thread = group.items[0];
            return <ThreadRow key={thread.threadId} thread={thread} onOpen={handleOpen} />;
          }
          const firstId = group.items[0]?.threadId ?? 'group';
          return <CollapsedGroup key={`group-${index}-${firstId}`} threads={group.items} onOpen={handleOpen} />;
        })}
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
