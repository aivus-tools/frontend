import { ChangeRate, Rate } from '@/types/rate.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const ratesApi = createApi({
  reducerPath: 'ratesApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Rate'],
  endpoints: (builder) => ({
    createRate: builder.mutation<Rate, ChangeRate>({
      query: (body) => ({
        url: ApiRoute.RATES,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rate'],
    }),
    getRates: builder.query<Rate[], void>({
      query: () => ApiRoute.RATES,
      providesTags: ['Rate'],
    }),
    getRate: builder.query<Rate, string>({
      query: (id) => ApiRoute.RATE(id),
      providesTags: ['Rate'],
    }),
    forkRate: builder.query<Rate, { entryId: string; basePrice: number }>({
      query: (body) => ({
        url: ApiRoute.RATES_FORK,
        method: 'POST',
        body,
      }),
    }),
    updateRate: builder.mutation<void, Partial<Rate> & Pick<Rate, 'id'>>({
      query: (body) => ({
        url: ApiRoute.RATE(body.id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Rate'],
    }),
    deleteRate: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.RATE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Rate'],
    }),
    lookupRate: builder.query<Rate | null, string>({
      query: (entryId) => `${ApiRoute.RATES_LOOKUP}?entryId=${entryId}`,
    }),
  }),
});

export const {
  useCreateRateMutation,
  useGetRatesQuery,
  useGetRateQuery,
  useUpdateRateMutation,
  useDeleteRateMutation,
  useLookupRateQuery,
} = ratesApi;
