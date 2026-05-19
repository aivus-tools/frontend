'use client';

import { useEffect } from 'react';
import { Drawer, Tabs, Tag, Spin, Empty, Alert, Typography } from 'antd';
import { useLazyGetBriefAiMessageTraceQuery } from '@/services/client/briefAiApi';
import { LLMCallTraceEntry } from '@/types/briefAi.interface';

import styles from './LLMTraceDrawer.module.css';

interface LLMTraceDrawerProps {
  briefId: string;
  messageId: string | null;
  open: boolean;
  onClose: () => void;
}

const PURPOSE_COLORS: Record<string, string> = {
  router: 'blue',
  generate: 'magenta',
  update: 'purple',
  answer: 'cyan',
  extract: 'gold',
  analyze: 'green',
  comparison: 'orange',
};

const formatJson = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

interface TraceCardProps {
  trace: LLMCallTraceEntry;
}

const TraceCard = (props: TraceCardProps) => {
  const trace = props.trace;
  return (
    <div className={styles.traceCard}>
      <div className={styles.traceHeader}>
        <Tag color={PURPOSE_COLORS[trace.purpose] ?? 'default'}>
          #{trace.sequence + 1} {trace.purpose}
        </Tag>
        <Tag>{trace.model}</Tag>
        <span className={styles.traceMeta}>
          {trace.inputTokens}/{trace.outputTokens} tokens · {trace.latencyMs}ms · ${trace.costUsd}
        </span>
      </div>

      <Typography.Text strong className={styles.sectionLabel}>
        Request params
      </Typography.Text>
      <pre className={styles.codeBox}>{formatJson(trace.requestParams)}</pre>

      <Typography.Text strong className={styles.sectionLabel}>
        Request messages ({trace.requestMessages.length})
      </Typography.Text>
      <div className={styles.messagesWrapper}>
        {trace.requestMessages.map((msg, index) => (
          <div key={index} className={styles.messageBox}>
            <Tag
              color={msg.role === 'system' ? 'gold' : msg.role === 'user' ? 'blue' : 'green'}
              className={styles.messageTag}
            >
              {msg.role}
            </Tag>
            <pre className={styles.messageContent}>{msg.content}</pre>
          </div>
        ))}
      </div>

      <Typography.Text strong className={styles.sectionLabel}>
        Raw response
      </Typography.Text>
      <pre className={styles.responseRaw}>{trace.responseRaw}</pre>
    </div>
  );
};

export const LLMTraceDrawer = (props: LLMTraceDrawerProps) => {
  const [fetchTrace, { data, isFetching, isError, error }] = useLazyGetBriefAiMessageTraceQuery();

  useEffect(() => {
    if (props.open && props.messageId) {
      fetchTrace({ briefId: props.briefId, messageId: props.messageId });
    }
  }, [props.open, props.messageId, props.briefId, fetchTrace]);

  return (
    <Drawer
      title='LLM call trace'
      placement='right'
      width='80vw'
      open={props.open}
      onClose={props.onClose}
      destroyOnClose
    >
      {isFetching && (
        <div className={styles.loadingWrapper}>
          <Spin />
        </div>
      )}

      {!isFetching && isError && (
        <Alert type='error' message='Failed to load trace' description={JSON.stringify(error)} showIcon />
      )}

      {!isFetching && !isError && data && (
        <>
          <div className={styles.summary}>
            <strong>Message:</strong> {data.messageId} · <strong>Model:</strong> {data.modelUsed} ·{' '}
            <strong>Tokens:</strong> {data.inputTokens}/{data.outputTokens} · <strong>Cost:</strong> ${data.costUsd}
          </div>

          {data.traces.length === 0 ? (
            <Empty description='No traces recorded for this message' />
          ) : (
            <Tabs
              items={[
                {
                  key: 'all',
                  label: `All calls (${data.traces.length})`,
                  children: (
                    <div>
                      {data.traces.map((trace) => (
                        <TraceCard key={trace.id} trace={trace} />
                      ))}
                    </div>
                  ),
                },
                ...data.traces.map((trace) => ({
                  key: trace.id,
                  label: `#${trace.sequence + 1} ${trace.purpose}`,
                  children: <TraceCard trace={trace} />,
                })),
              ]}
            />
          )}
        </>
      )}
    </Drawer>
  );
};
