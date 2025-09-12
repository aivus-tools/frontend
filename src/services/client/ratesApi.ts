import { Rate } from '@/types/rate.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const ratesApi = createApi({
  reducerPath: 'ratesApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    createRate: builder.mutation<void, Rate>({
      query: (body) => ({
        url: ApiRoute.RATES,
        method: 'POST',
        body,
      }),
    }),
    getRates: builder.query<Rate[], void>({
      query: () => ApiRoute.RATES,
    }),
    getRate: builder.query<Rate, string>({
      query: (id) => ApiRoute.RATE(id),
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
    }),
    deleteRate: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.RATE(id),
        method: 'DELETE',
      }),
    }),
  }),
});
