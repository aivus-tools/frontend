export type SectionStatus = 'empty' | 'draft' | 'complete';
export type ConversationPhase = 'initial' | 'questioning' | 'refining' | 'complete';
export type FeedbackRating = 'up' | 'down';

export const BRIEF_SECTION_KEYS = [
  'project_header',
  'budget_timeline',
  'strategic_foundation',
  'creative_direction',
  'scope_video',
  'scope_photo',
  'post_production',
  'usage_rights',
  'deliverables',
] as const;

export type BriefSectionKey = (typeof BRIEF_SECTION_KEYS)[number];

export interface BriefV2 {
  id: string;
  status: string;
  documentHtml: string;
  sectionsStatus: Record<string, SectionStatus>;
  archetypes: number[];
  conversationPhase: ConversationPhase;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: string;
  messageCount: number;
  version: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ChatMessageV2 {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sectionsChanged: string[];
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: string;
  createdAt: string;
}

export interface BriefV2Detail extends BriefV2 {
  messages: ChatMessageV2[];
}

export interface BriefV2StartResponse {
  briefId: string;
  taskId: string;
}

export interface BriefV2TaskStatus {
  status: 'pending' | 'done' | 'failed';
  result: BriefV2 | null;
  error: string | null;
}

export interface BriefV2ChatResponse {
  reply: string;
  documentHtml: string;
  sectionPatches: Record<string, string>;
  sectionsChanged: string[];
  sectionsStatus: Record<string, SectionStatus>;
  archetypes: number[];
  conversationPhase: ConversationPhase;
  version: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: string;
}

export interface BriefV2SectionUpdateResponse {
  version: number;
  sectionKey: string;
}

export interface BriefFeedbackResponse {
  id: string;
  briefId: string;
  messageId: string | null;
  sectionKey: string;
  rating: FeedbackRating;
  comment: string;
  createdAt: string;
}

export interface PublicBriefStartResponse {
  briefId: string;
  token: string;
  taskId: string;
}
