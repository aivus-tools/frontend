import { Offer, NewOffer } from '@/types/offer.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getAllOffers: builder.query<Offer[], void>({
      query: () => ApiRoute.OFFER_LIST,
    }),
    createOffer: builder.mutation<Offer, NewOffer>({
      query: (body) => ({
        url: ApiRoute.OFFER_LIST,
        method: 'POST',
        body,
      }),
    }),
    getOfferById: builder.query<Offer, string>({
      query: (id) => ApiRoute.OFFER_BY_ID(id),
    }),
    updateOffer: builder.mutation<Offer, Partial<Offer> & Pick<Offer, 'id'>>({
      query: (body) => ({
        url: ApiRoute.OFFER_BY_ID(body.id),
        method: 'PUT',
        body,
      }),
    }),
    deleteOffer: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.OFFER_BY_ID(id),
        method: 'DELETE',
      }),
    }),
    getOffersByBriefId: builder.query<Offer[], string>({
      query: (briefId) => ApiRoute.OFFERS_BY_BRIEF_ID(briefId),
    }),
  }),
});
