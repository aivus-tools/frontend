export type EmailAccountRole = 'monitor' | 'agent';

export type EmailAccountStatus = 'connected' | 'expired' | 'revoked' | 'disconnected';

export type ThreadState = 'monitoring' | 'engaged' | 'paused' | 'human_takeover';

export type OutboundDraftStatus = 'pending' | 'approved' | 'sent' | 'expired' | 'rejected';

export type OutboundDraftKind = 'first_reply' | 'follow_up' | 'other';

export type ActionItemAssignee = 'client' | 'producer' | 'agent';

export type ActionItemStatus = 'open' | 'done' | 'overdue';

export type NotificationMode = 'every' | 'urgent_and_digest';

export type FollowupKind = 'overdue_promise' | 'stuck_approval' | 'stale_thread' | 'overdue_first_reply';

export interface WorkingHours {
  timezone?: string;
  start?: string;
  end?: string;
  days?: number[];
}

export interface AgentProfile {
  instruction: string;
  businessContext: string;
  tone: string;
  specialRules: string[];
  producerEmail: string;
  workingHours: WorkingHours;
  notificationRules: { mode?: NotificationMode };
  autonomyMode: string;
}

export interface AgentProfilePayload {
  instruction?: string;
  businessContext?: string;
  tone?: string;
  specialRules?: string[];
  producerEmail?: string;
  workingHours?: WorkingHours;
  notificationRules?: { mode: NotificationMode };
}

export interface Mailbox {
  id: string;
  role: EmailAccountRole;
  email: string;
  provider: string;
  status: EmailAccountStatus;
  lastSyncedAt: string | null;
}

export interface ConnectMailboxPayload {
  role: EmailAccountRole;
  email: string;
  credential: string;
}

export interface OutboundDraftDto {
  id: string;
  threadId: string;
  kind: OutboundDraftKind;
  status: OutboundDraftStatus;
  body: string;
  to: string[];
  cc: string[];
  subject: string;
  inReplyToPreview: string;
  inReplyToFrom: string;
  inReplyToDate: string | null;
  variant: string;
  action: string;
  edited: boolean;
  overdue: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface ThreadSummary {
  threadId: string;
  clientEmail: string;
  clientName: string;
  subject: string;
  state: ThreadState;
  projectId: string | null;
  projectName: string;
  needsAction: boolean;
  pendingDraftCount: number;
  overdueItemCount: number;
  openItemCount: number;
  lastActivityAt: string;
}

export interface ThreadsPage {
  threads: ThreadSummary[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface FollowupItem {
  kind: FollowupKind;
  threadId: string;
  subject: string;
  clientEmail: string;
  detail: string;
  draftId?: string;
  since?: string | null;
}

export interface FollowupsResponse {
  followups: FollowupItem[];
  total: number;
}

export interface ActionItemDto {
  id: string;
  assignee: ActionItemAssignee;
  text: string;
  status: ActionItemStatus;
  dueAt: string | null;
  createdAt: string;
}

export interface ActivityEvent {
  kind: 'message' | 'log';
  text: string;
  createdAt: string;
  event?: string;
}

export interface ThreadActivity {
  threadId: string;
  clientEmail: string;
  subject: string;
  state: ThreadState;
  memory: Record<string, unknown>;
  actionItems: ActionItemDto[];
  events: ActivityEvent[];
}
