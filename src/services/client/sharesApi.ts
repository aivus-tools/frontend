import { Share, CreateSharePayload, UpdateSharePayload, PublicOfferData } from '@/types/share.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const sharesApi = createApi({
  reducerPath: 'sharesApi',
  baseQuery: fetchBaseQuery(),
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
        url: ApiRoute.SHARE_BY_TOKEN(token),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Share'],
    }),
    getShareByOfferId: builder.query<Share, string>({
      query: (offerId) => `${ApiRoute.SHARE_LIST}?offerId=${offerId}`,
      providesTags: ['Share'],
    }),
  }),
});

export const {
  useCreateShareMutation,
  useGetShareByTokenQuery,
  useUpdateShareMutation,
  useGetShareByOfferIdQuery,
} = sharesApi;
