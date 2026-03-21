import { Share, CreateSharePayload, UpdateSharePayload, PublicOfferData } from '@/types/share.interface';
import { OfferExportData } from '@/types/exportData.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const sharesApi = createApi({
  reducerPath: 'sharesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['Share'],
  endpoints: (builder) => ({
    createShare: builder.mutation<Share, CreateSharePayload>({
      query: (body) => ({
        url: ApiRoute.SHARE_LIST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Share'],
    }),
    getShareByToken: builder.query<PublicOfferData, string>({
      query: (token) => ApiRoute.SHARE_BY_TOKEN(token),
      providesTags: ['Share'],
    }),
    updateShare: builder.mutation<Share, UpdateSharePayload>({
      query: ({ token, ...body }) => ({
        url: `${ApiRoute.SHARE_BY_TOKEN(token)}/manage`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Share'],
    }),
    getShareByOfferId: builder.query<Share, string>({
      query: (offerId) => `${ApiRoute.SHARE_LIST}?offerId=${offerId}`,
      providesTags: ['Share'],
    }),
    linkShareToBrief: builder.mutation<{ id: string; briefId: string; offerId: string }, { token: string; briefId: string }>({
      query: ({ token, briefId }) => ({
        url: ApiRoute.SHARE_LINK_TO_BRIEF(token),
        method: 'POST',
        body: { briefId },
      }),
    }),
    getShareExportData: builder.query<OfferExportData, string>({
      query: (token) => ApiRoute.SHARE_EXPORT_DATA(token),
    }),
  }),
});

export const {
  useCreateShareMutation,
  useGetShareByTokenQuery,
  useUpdateShareMutation,
  useGetShareByOfferIdQuery,
  useLinkShareToBriefMutation,
  useGetShareExportDataQuery,
} = sharesApi;
