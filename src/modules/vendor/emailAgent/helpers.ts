import { t } from '@/lib/i18n';
import {
  ActionItemAssignee,
  ActionItemStatus,
  EmailAccountStatus,
  FollowupKind,
  OutboundDraftKind,
  ThreadState,
} from '@/types/emailAgent.interface';

export const getBackendErrorMessage = (error: unknown): string | null => {
  if (typeof error !== 'object' || error == null || !('data' in error)) {
    return null;
  }
  const data = (error as { data: unknown }).data;
  if (typeof data !== 'object' || data == null || !('error' in data)) {
    return null;
  }
  const value = (data as { error: unknown }).error;
  return typeof value === 'string' ? value : null;
};

export const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

type TagColor = 'default' | 'blue' | 'green' | 'orange' | 'red' | 'purple';

export const threadStateLabel = (state: ThreadState): string => {
  const map: Record<ThreadState, string> = {
    monitoring: t('EMAIL_AGENT_STATE_MONITORING'),
    engaged: t('EMAIL_AGENT_STATE_ENGAGED'),
    paused: t('EMAIL_AGENT_STATE_PAUSED'),
    human_takeover: t('EMAIL_AGENT_STATE_HUMAN_TAKEOVER'),
  };
  return map[state] ?? state;
};

export const threadStateColor = (state: ThreadState): TagColor => {
  const map: Record<ThreadState, TagColor> = {
    monitoring: 'default',
    engaged: 'blue',
    paused: 'orange',
    human_takeover: 'purple',
  };
  return map[state] ?? 'default';
};

export const mailboxStatusLabel = (status: EmailAccountStatus): string => {
  if (status === 'connected') {
    return t('EMAIL_AGENT_MAILBOX_CONNECTED');
  }
  if (status === 'expired') {
    return t('EMAIL_AGENT_MAILBOX_EXPIRED');
  }
  return t('EMAIL_AGENT_MAILBOX_DISCONNECTED');
};

export const mailboxStatusColor = (status: EmailAccountStatus): TagColor => {
  if (status === 'connected') {
    return 'green';
  }
  if (status === 'expired') {
    return 'orange';
  }
  return 'default';
};

export const draftKindLabel = (kind: OutboundDraftKind): string => {
  if (kind === 'follow_up') {
    return t('EMAIL_AGENT_DRAFT_FOLLOWUP');
  }
  return t('EMAIL_AGENT_DRAFT_VARIANT');
};

export const followupKindLabel = (kind: FollowupKind): string => {
  const map: Record<FollowupKind, string> = {
    overdue_promise: t('EMAIL_AGENT_FOLLOWUP_OVERDUE_PROMISE'),
    stuck_approval: t('EMAIL_AGENT_FOLLOWUP_STUCK_APPROVAL'),
    stale_thread: t('EMAIL_AGENT_FOLLOWUP_STALE_THREAD'),
    overdue_first_reply: t('EMAIL_AGENT_FOLLOWUP_OVERDUE_FIRST_REPLY'),
  };
  return map[kind] ?? kind;
};

export const followupKindColor = (kind: FollowupKind): TagColor => {
  const map: Record<FollowupKind, TagColor> = {
    overdue_promise: 'red',
    stuck_approval: 'blue',
    stale_thread: 'orange',
    overdue_first_reply: 'red',
  };
  return map[kind] ?? 'default';
};

export const assigneeLabel = (assignee: ActionItemAssignee): string => {
  const map: Record<ActionItemAssignee, string> = {
    client: t('EMAIL_AGENT_ASSIGNEE_CLIENT'),
    producer: t('EMAIL_AGENT_ASSIGNEE_PRODUCER'),
    agent: t('EMAIL_AGENT_ASSIGNEE_AGENT'),
  };
  return map[assignee] ?? assignee;
};

export const itemStatusLabel = (status: ActionItemStatus): string => {
  const map: Record<ActionItemStatus, string> = {
    open: t('EMAIL_AGENT_ITEM_STATUS_OPEN'),
    done: t('EMAIL_AGENT_ITEM_STATUS_DONE'),
    overdue: t('EMAIL_AGENT_ITEM_STATUS_OVERDUE'),
  };
  return map[status] ?? status;
};

export const itemStatusColor = (status: ActionItemStatus): TagColor => {
  const map: Record<ActionItemStatus, TagColor> = {
    open: 'default',
    done: 'green',
    overdue: 'red',
  };
  return map[status] ?? 'default';
};
