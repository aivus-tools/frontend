export type ConversationStatus = 'in_progress' | 'ready_to_finalize' | 'finalized';
export type FeedbackRating = 'up' | 'down';
export type FinalDocumentKind = 'production_brief' | 'vendor_email' | 'deliverables_checklist';

export interface BriefAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string | null;
  createdAt: string | null;
}

export interface BriefFeedback {
  id: string;
  messageId: string | null;
  rating: FeedbackRating;
  comment: string;
  userId: string | null;
  createdAt: string | null;
}

export type ChatMessageKind = 'chat' | 'feedback_request' | 'feedback_reply_ack';

export interface ChatMessageV3 {
  id: string;
  role: 'user' | 'assistant';
  kind?: ChatMessageKind;
  content: string;
  readyToFinalize: boolean;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: string;
  hasTrace?: boolean;
  attachments: BriefAttachment[];
  feedback: BriefFeedback | null;
  createdAt: string | null;
}

export interface BriefV3 {
  id: string;
  status: string;
  title: string;
  documentLanguage: string;
  conversationStatus: ConversationStatus;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: string;
  messageCount: number;
  showCost: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  claimedAt: string | null;
}

export interface BriefShareInfo {
  id: string;
  briefId: string;
  token: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BriefShareView {
  token: string;
  briefId: string;
  title: string;
  documentLanguage: string;
  conversationStatus: ConversationStatus;
  documents: BriefFinalDocument[];
  createdAt: string | null;
}

export interface BriefV3Detail extends BriefV3 {
  messages: ChatMessageV3[];
}

export interface BriefV3ListItem {
  id: string;
  status: string;
  title: string;
  conversationStatus: ConversationStatus;
  messageCount: number;
  totalCostUsd: string;
  createdAt: string | null;
  updatedAt: string | null;
  claimedAt: string | null;
  offersCount: number;
}

export interface BriefV3StartResponse {
  briefId: string;
  taskId: string;
  token?: string;
}

export interface BriefV3TaskStatus {
  status: 'pending' | 'done' | 'failed';
  result: BriefV3Detail | null;
  error: string | null;
}

export interface BriefV3ChatResponse {
  reply: string;
  messageId: string;
  readyToFinalize: boolean;
  conversationStatus: ConversationStatus;
  documentLanguage: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: string;
  messageCount: number;
}

export interface BriefFeedbackResponse {
  id: string;
  messageId: string | null;
  rating: FeedbackRating;
  comment: string;
  userId: string | null;
  createdAt: string | null;
}

export interface BriefFinalDocument {
  id: string;
  kind: FinalDocumentKind;
  html: string;
  plainText: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BriefFinalPackage {
  briefId: string;
  conversationStatus: ConversationStatus;
  documents: BriefFinalDocument[];
}

export interface LLMCallTraceEntry {
  id: string;
  sequence: number;
  purpose: string;
  model: string;
  requestMessages: Array<{ role: string; content?: string; parts?: unknown[] }>;
  requestParams: Record<string, unknown>;
  responseRaw: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: string;
  latencyMs: number;
  createdAt: string | null;
}

export interface LLMMessageTraceResponse {
  messageId: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: string;
  createdAt: string | null;
  traces: LLMCallTraceEntry[];
}
