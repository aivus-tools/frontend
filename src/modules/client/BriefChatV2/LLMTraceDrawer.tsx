'use client';

import React, { useEffect } from 'react';
import { Drawer, Tabs, Tag, Spin, Empty, Alert, Typography } from 'antd';
import { useLazyGetBriefAiMessageTraceQuery } from '@/services/client/briefAiApi';
import { LLMCallTraceEntry } from '@/types/briefV2.interface';

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

const TraceCard: React.FC<{ trace: LLMCallTraceEntry }> = ({ trace }) => {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        background: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Tag color={PURPOSE_COLORS[trace.purpose] ?? 'default'}>
          #{trace.sequence + 1} {trace.purpose}
        </Tag>
        <Tag>{trace.model}</Tag>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {trace.inputTokens}/{trace.outputTokens} tokens · {trace.latencyMs}ms · ${trace.costUsd}
        </span>
      </div>

      <Typography.Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
        Request params
      </Typography.Text>
      <pre
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          padding: 8,
          fontSize: 11,
          fontFamily: 'monospace',
          margin: 0,
          marginBottom: 12,
          maxHeight: 120,
          overflow: 'auto',
        }}
      >
        {formatJson(trace.requestParams)}
      </pre>

      <Typography.Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
        Request messages ({trace.requestMessages.length})
      </Typography.Text>
      <div style={{ marginBottom: 12 }}>
        {trace.requestMessages.map((msg, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              padding: 8,
              marginBottom: 6,
            }}
          >
            <Tag
              color={msg.role === 'system' ? 'gold' : msg.role === 'user' ? 'blue' : 'green'}
              style={{ marginBottom: 6 }}
            >
              {msg.role}
            </Tag>
            <pre
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 320,
                overflow: 'auto',
              }}
            >
              {msg.content}
            </pre>
          </div>
        ))}
      </div>

      <Typography.Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
        Raw response
      </Typography.Text>
      <pre
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          padding: 8,
          fontSize: 11,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
          maxHeight: 480,
          overflow: 'auto',
        }}
      >
        {trace.responseRaw}
      </pre>
    </div>
  );
};

export const LLMTraceDrawer: React.FC<LLMTraceDrawerProps> = (props) => {
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin />
        </div>
      )}

      {!isFetching && isError && (
        <Alert type='error' message='Failed to load trace' description={JSON.stringify(error)} showIcon />
      )}

      {!isFetching && !isError && data && (
        <>
          <div style={{ marginBottom: 16, fontSize: 12, color: '#6b7280' }}>
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
