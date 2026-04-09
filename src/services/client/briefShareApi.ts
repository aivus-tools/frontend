import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import { SectionStatus } from '@/types/briefV2.interface';

interface BriefShareData {
  id: string;
  briefId: string;
  token: string;
  isActive: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface BriefSharePublicData {
  token: string;
  isActive: boolean;
  brief: {
    id: string;
    status: string;
    documentHtml: string;
    structuredData: Record<string, unknown> | null;
    sectionsStatus: Record<string, SectionStatus>;
    createdAt: string | null;
  };
}

export const briefShareApi = createApi({
  reducerPath: 'briefShareApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['BriefShare'],
  endpoints: (builder) => ({
    createBriefShare: builder.mutation<BriefShareData, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_SHARE(briefId),
        method: 'POST',
      }),
      invalidatesTags: ['BriefShare'],
    }),
    getBriefShareByBriefId: builder.query<BriefShareData, string>({
      query: (briefId) => ApiRoute.BRIEF_AI_SHARE(briefId),
      providesTags: ['BriefShare'],
    }),
    updateBriefShare: builder.mutation<BriefShareData, { token: string; isActive: boolean }>({
      query: (x) => ({
        url: ApiRoute.BRIEF_SHARE_MANAGE(x.token),
        method: 'PATCH',
        body: { isActive: x.isActive },
      }),
      invalidatesTags: ['BriefShare'],
    }),
    getPublicBriefShare: builder.query<BriefSharePublicData, string>({
      query: (token) => ApiRoute.BRIEF_SHARE_PUBLIC(token),
    }),
  }),
});

export const {
  useCreateBriefShareMutation,
  useGetBriefShareByBriefIdQuery,
  useUpdateBriefShareMutation,
  useGetPublicBriefShareQuery,
} = briefShareApi;
