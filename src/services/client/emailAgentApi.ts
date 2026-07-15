import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import {
  AgentProfile,
  AgentProfilePayload,
  ConnectMailboxPayload,
  FollowupsResponse,
  Mailbox,
  OutboundDraftDto,
  ThreadActivity,
  ThreadsPage,
} from '@/types/emailAgent.interface';

interface MailboxesResponse {
  mailboxes: Mailbox[];
}

interface DraftsResponse {
  drafts: OutboundDraftDto[];
}

interface DraftResponse {
  draft: OutboundDraftDto;
  messageId?: string;
}

interface ThreadsQueryArgs {
  limit?: number;
  offset?: number;
}

export const emailAgentApi = createApi({
  reducerPath: 'emailAgentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['Profile', 'Mailboxes', 'Drafts', 'Threads', 'Followups'],
  endpoints: (builder) => ({
    getAgentProfile: builder.query<AgentProfile, void>({
      query: () => ApiRoute.EMAIL_AGENT_PROFILE,
      providesTags: ['Profile'],
    }),
    updateAgentProfile: builder.mutation<AgentProfile, AgentProfilePayload>({
      query: (body) => ({ url: ApiRoute.EMAIL_AGENT_PROFILE, method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    getMailboxes: builder.query<MailboxesResponse, void>({
      query: () => ApiRoute.EMAIL_AGENT_MAILBOXES,
      providesTags: ['Mailboxes'],
    }),
    connectMailbox: builder.mutation<Mailbox, ConnectMailboxPayload>({
      query: (body) => ({
        url: ApiRoute.EMAIL_AGENT_MAILBOX_CONNECT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Mailboxes'],
    }),
    disconnectMailbox: builder.mutation<{ status: string }, string>({
      query: (accountId) => ({
        url: ApiRoute.EMAIL_AGENT_MAILBOX_DISCONNECT(accountId),
        method: 'POST',
      }),
      invalidatesTags: ['Mailboxes'],
    }),
    getDrafts: builder.query<DraftsResponse, void>({
      query: () => ApiRoute.EMAIL_AGENT_DRAFTS,
      providesTags: ['Drafts'],
    }),
    approveDraft: builder.mutation<DraftResponse, { draftId: string; body?: string }>({
      query: (args) => ({
        url: ApiRoute.EMAIL_AGENT_DRAFT_APPROVE(args.draftId),
        method: 'POST',
        body: args.body ? { body: args.body } : {},
      }),
      invalidatesTags: ['Drafts', 'Threads', 'Followups'],
    }),
    editDraft: builder.mutation<DraftResponse, { draftId: string; body: string }>({
      query: (args) => ({
        url: ApiRoute.EMAIL_AGENT_DRAFT_EDIT(args.draftId),
        method: 'POST',
        body: { body: args.body },
      }),
      invalidatesTags: ['Drafts'],
    }),
    rejectDraft: builder.mutation<DraftResponse, string>({
      query: (draftId) => ({
        url: ApiRoute.EMAIL_AGENT_DRAFT_REJECT(draftId),
        method: 'POST',
      }),
      invalidatesTags: ['Drafts', 'Followups'],
    }),
    getThreads: builder.query<ThreadsPage, ThreadsQueryArgs>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args.limit != null) {
          params.set('limit', String(args.limit));
        }
        if (args.offset != null) {
          params.set('offset', String(args.offset));
        }
        const suffix = params.toString();
        return suffix ? `${ApiRoute.EMAIL_AGENT_THREADS}?${suffix}` : ApiRoute.EMAIL_AGENT_THREADS;
      },
      providesTags: ['Threads'],
    }),
    getFollowups: builder.query<FollowupsResponse, void>({
      query: () => ApiRoute.EMAIL_AGENT_FOLLOWUPS,
      providesTags: ['Followups'],
    }),
    getThreadActivity: builder.query<ThreadActivity, string>({
      query: (threadId) => ApiRoute.EMAIL_AGENT_THREAD_ACTIVITY(threadId),
    }),
    prepareFollowup: builder.mutation<DraftResponse, string>({
      query: (threadId) => ({
        url: ApiRoute.EMAIL_AGENT_PREPARE_FOLLOWUP(threadId),
        method: 'POST',
      }),
      invalidatesTags: ['Drafts', 'Followups'],
    }),
  }),
});

export const {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
  useGetMailboxesQuery,
  useConnectMailboxMutation,
  useDisconnectMailboxMutation,
  useGetDraftsQuery,
  useApproveDraftMutation,
  useEditDraftMutation,
  useRejectDraftMutation,
  useGetThreadsQuery,
  useGetFollowupsQuery,
  useGetThreadActivityQuery,
  usePrepareFollowupMutation,
} = emailAgentApi;
