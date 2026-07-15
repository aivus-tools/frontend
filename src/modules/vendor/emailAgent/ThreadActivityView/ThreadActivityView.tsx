'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Tag, Timeline } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import { useGetThreadActivityQuery } from '@/services/client/emailAgentApi';
import { PageSpinner } from '@/components/PageSpinner';
import {
  assigneeLabel,
  formatDate,
  itemStatusColor,
  itemStatusLabel,
  threadStateColor,
  threadStateLabel,
} from '../helpers';

import styles from './ThreadActivityView.module.css';

interface ThreadActivityViewProps {
  threadId: string;
}

export const ThreadActivityView = (props: ThreadActivityViewProps) => {
  const router = useRouter();
  const { data, isLoading } = useGetThreadActivityQuery(props.threadId);

  if (isLoading || !data) {
    return <PageSpinner />;
  }

  const timelineItems = data.events.map((event, index) => ({
    key: `${event.createdAt}-${index}`,
    children: (
      <div className={styles.event}>
        <span className={styles.eventText}>{event.text}</span>
        <span className={styles.eventDate}>{formatDate(event.createdAt)}</span>
      </div>
    ),
  }));

  return (
    <div className={styles.wrapper}>
      <Button
        type='link'
        icon={<ArrowLeftOutlined />}
        className={styles.back}
        onClick={() => router.push(AppRoute.EMAIL_AGENT)}
      >
        {t('EMAIL_AGENT_BACK_TO_FEED')}
      </Button>

      <div className={styles.header}>
        <h1 className={styles.subject}>{data.subject || data.clientEmail || t('EMAIL_AGENT_THREAD_TITLE')}</h1>
        <Tag color={threadStateColor(data.state)}>{threadStateLabel(data.state)}</Tag>
      </div>
      <div className={styles.client}>{data.clientEmail}</div>

      <Card className={styles.section} title={t('EMAIL_AGENT_THREAD_ACTION_ITEMS')} size='small'>
        {data.actionItems.length === 0 ? (
          <p className={styles.empty}>{t('EMAIL_AGENT_THREAD_NO_ITEMS')}</p>
        ) : (
          <ul className={styles.itemList}>
            {data.actionItems.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <Tag>{assigneeLabel(item.assignee)}</Tag>
                  <span className={styles.itemText}>{item.text}</span>
                </div>
                <div className={styles.itemMeta}>
                  <Tag color={itemStatusColor(item.status)}>{itemStatusLabel(item.status)}</Tag>
                  {item.dueAt && <span className={styles.due}>{t('EMAIL_AGENT_DUE', formatDate(item.dueAt))}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className={styles.section} title={t('EMAIL_AGENT_THREAD_TIMELINE')} size='small'>
        <Timeline items={timelineItems} />
      </Card>
    </div>
  );
};
