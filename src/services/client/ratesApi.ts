import {
  RateCard,
  RateCardItem,
  CreateRateCardPayload,
  UpdateRateCardPayload,
} from '@/types/rate.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const ratesApi = createApi({
  reducerPath: 'ratesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['RateCard'],
  endpoints: (builder) => ({
    getRateCards: builder.query<RateCard[], void>({
      query: () => ApiRoute.RATES,
      providesTags: ['RateCard'],
    }),
    getRateCard: builder.query<RateCard, string>({
      query: (id) => ApiRoute.RATE(id),
      providesTags: ['RateCard'],
    }),
    createRateCard: builder.mutation<RateCard, CreateRateCardPayload>({
      query: (body) => ({
        url: ApiRoute.RATES,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RateCard'],
    }),
    updateRateCard: builder.mutation<RateCard, { id: string } & UpdateRateCardPayload>({
      query: ({ id, ...body }) => ({
        url: ApiRoute.RATE(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['RateCard'],
    }),
    deleteRateCard: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.RATE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['RateCard'],
    }),
    lookupRate: builder.query<RateCardItem[], string>({
      query: (entryId) => `${ApiRoute.RATES_LOOKUP}?entryId=${entryId}`,
    }),
  }),
});

export const {
  useGetRateCardsQuery,
  useGetRateCardQuery,
  useCreateRateCardMutation,
  useUpdateRateCardMutation,
  useDeleteRateCardMutation,
  useLookupRateQuery,
} = ratesApi;
