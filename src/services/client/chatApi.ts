import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ChatResponse, AnalysisResponse } from '@/types/chat.interface';
import { ApiRoute } from '@/constants/apiRoute';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    sendMessage: builder.mutation<ChatResponse, { message: string; history: { role: string; content: string }[] }>({
      query: (body) => ({
        url: ApiRoute.BRIEF_CHAT,
        method: 'POST',
        body,
      }),
    }),
    analyzeBrief: builder.mutation<AnalysisResponse, { brief_data: Record<string, unknown> }>({
      query: (body) => ({
        url: ApiRoute.BRIEF_CHAT_ANALYZE,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendMessageMutation, useAnalyzeBriefMutation } = chatApi;
