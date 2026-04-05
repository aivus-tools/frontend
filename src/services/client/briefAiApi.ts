import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import {
  BriefV2,
  BriefV2StartResponse,
  BriefV2TaskStatus,
  BriefV2ChatResponse,
  BriefV2Detail,
  BriefV2SectionUpdateResponse,
  BriefFeedbackResponse,
  FeedbackRating,
} from '@/types/briefV2.interface';

export const briefAiApi = createApi({
  reducerPath: 'briefAiApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['BriefV2'],
  endpoints: (builder) => ({
    startBriefAi: builder.mutation<BriefV2StartResponse, { message: string }>({
      query: (body) => ({
        url: ApiRoute.BRIEF_AI_START,
        method: 'POST',
        body,
      }),
    }),
    getBriefAiStatus: builder.query<BriefV2TaskStatus, { briefId: string; taskId: string }>({
      query: (args) => ({
        url: `${ApiRoute.BRIEF_AI_STATUS(args.briefId)}?taskId=${args.taskId}`,
        method: 'GET',
      }),
    }),
    sendBriefAiChat: builder.mutation<BriefV2ChatResponse, { briefId: string; message: string }>({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_CHAT(args.briefId),
        method: 'POST',
        body: { message: args.message },
      }),
      invalidatesTags: ['BriefV2'],
    }),
    getBriefAiDetail: builder.query<BriefV2Detail, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_DETAIL(briefId),
        method: 'GET',
      }),
      providesTags: ['BriefV2'],
    }),
    updateBriefAiSection: builder.mutation<
      BriefV2SectionUpdateResponse,
      { briefId: string; sectionKey: string; html: string; expectedVersion: number }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_SECTION(args.briefId),
        method: 'PATCH',
        body: {
          sectionKey: args.sectionKey,
          html: args.html,
          expectedVersion: args.expectedVersion,
        },
      }),
      invalidatesTags: ['BriefV2'],
    }),
    sendBriefAiFeedback: builder.mutation<
      BriefFeedbackResponse,
      {
        briefId: string;
        messageId: string | null;
        sectionKey: string;
        rating: FeedbackRating;
        comment: string;
      }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_FEEDBACK(args.briefId),
        method: 'POST',
        body: {
          messageId: args.messageId,
          sectionKey: args.sectionKey,
          rating: args.rating,
          comment: args.comment,
        },
      }),
    }),
    finalizeBriefAi: builder.mutation<{ taskId: string }, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_FINALIZE(briefId),
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useStartBriefAiMutation,
  useLazyGetBriefAiStatusQuery,
  useSendBriefAiChatMutation,
  useGetBriefAiDetailQuery,
  useUpdateBriefAiSectionMutation,
  useSendBriefAiFeedbackMutation,
  useFinalizeBriefAiMutation,
} = briefAiApi;
