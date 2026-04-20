import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ComparisonData, AnalysisResponse } from '@/types/chat.interface';
import { ApiRoute } from '@/constants/apiRoute';

export const comparisonApi = createApi({
  reducerPath: 'comparisonApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['Comparison'],
  endpoints: (builder) => ({
    getComparison: builder.query<ComparisonData, string>({
      query: (briefId) => ApiRoute.BRIEF_COMPARISON(briefId),
      providesTags: ['Comparison'],
    }),
    analyzeComparison: builder.mutation<
      AnalysisResponse,
      {
        briefId: string;
        question?: string;
        history?: { role: 'user' | 'assistant'; content: string }[];
      }
    >({
      query: ({ briefId, question, history }) => ({
        url: ApiRoute.BRIEF_COMPARISON_ANALYZE(briefId),
        method: 'POST',
        body: { question, history },
      }),
    }),
  }),
});

export const { useGetComparisonQuery, useAnalyzeComparisonMutation } = comparisonApi;
