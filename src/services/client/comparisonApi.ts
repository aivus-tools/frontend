import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ComparisonData, AnalysisResponse } from '@/types/chat.interface';
import { ApiRoute } from '@/constants/apiRoute';

export const comparisonApi = createApi({
  reducerPath: 'comparisonApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Comparison'],
  endpoints: (builder) => ({
    getComparison: builder.query<ComparisonData, string>({
      query: (briefId) => ApiRoute.BRIEF_COMPARISON(briefId),
      providesTags: ['Comparison'],
    }),
    analyzeComparison: builder.mutation<AnalysisResponse, { briefId: string; question?: string }>({
      query: ({ briefId, question }) => ({
        url: ApiRoute.BRIEF_COMPARISON_ANALYZE(briefId),
        method: 'POST',
        body: { question },
      }),
    }),
  }),
});

export const { useGetComparisonQuery, useAnalyzeComparisonMutation } = comparisonApi;
