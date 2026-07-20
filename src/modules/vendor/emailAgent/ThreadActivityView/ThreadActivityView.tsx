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
  formatDateTime,
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

  const timelineItems = data.events.map((event, index) => {
    const isMessage = event.kind === 'message';
    const directionTag = isMessage
      ? event.direction === 'in'
        ? { color: 'blue', label: t('EMAIL_AGENT_MESSAGE_INBOUND') }
        : { color: 'geekblue', label: t('EMAIL_AGENT_MESSAGE_OUTBOUND') }
      : null;
    return {
      key: `${event.createdAt}-${index}`,
      color: isMessage ? (event.direction === 'in' ? 'blue' : 'green') : 'gray',
      children: (
        <div className={styles.event}>
          <div className={styles.eventHead}>
            {directionTag && <Tag color={directionTag.color}>{directionTag.label}</Tag>}
            <span className={styles.eventText}>{isMessage ? event.subject || event.text : event.text}</span>
          </div>
          {isMessage && event.from && <div className={styles.eventFrom}>{event.from}</div>}
          {isMessage && event.preview && <div className={styles.eventPreview}>{event.preview}</div>}
          <div className={styles.eventDate}>{formatDateTime(event.createdAt)}</div>
        </div>
      ),
    };
  });

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
