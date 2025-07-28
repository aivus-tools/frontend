import { Offer, NewOffer } from '@/types/offer';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/service' }),
  endpoints: (builder) => ({
    getAllOffers: builder.query<Offer[], void>({
      query: () => '/offers',
    }),
    createOffer: builder.mutation<Offer, NewOffer>({
      query: (body) => ({
        url: '/offers',
        method: 'POST',
        body,
      }),
    }),
    getOfferById: builder.query<Offer, string>({
      query: (id) => `/offers/${id}`,
    }),
    updateOffer: builder.mutation<Offer, Partial<Offer> & Pick<Offer, 'id'>>({
      query: (body) => ({
        url: `/offers/${body.id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteOffer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/offers/${id}`,
        method: 'DELETE',
      }),
    }),
    getOffersByBriefId: builder.query<Offer[], string>({
      query: (briefId) => `/offers/brief/${briefId}`,
    }),
  }),
});
