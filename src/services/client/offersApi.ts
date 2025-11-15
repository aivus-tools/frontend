import { Offer, NewOffer } from '@/types/offer.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Offer'],
  endpoints: (builder) => ({
    getAllOffers: builder.query<Offer[], void>({
      query: () => ApiRoute.OFFER_LIST,
      providesTags: ['Offer'],
    }),
    createOffer: builder.mutation<Offer, NewOffer>({
      query: (body) => ({
        url: ApiRoute.OFFER_LIST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Offer'],
    }),
    getOfferById: builder.query<Offer, string>({
      query: (id) => ApiRoute.OFFER_BY_ID(id),
      providesTags: ['Offer'],
    }),
    updateOffer: builder.mutation<Offer, Partial<Offer> & Pick<Offer, 'id'>>({
      query: (body) => ({
        url: ApiRoute.OFFER_BY_ID(body.id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Offer'],
    }),
    deleteOffer: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.OFFER_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Offer'],
    }),
    getOffersByProjectId: builder.query<Offer[], string>({
      query: (projectId) => ApiRoute.OFFERS_BY_PROJECT_ID(projectId),
      providesTags: ['Offer'],
    }),
  }),
});

export const {
  useGetAllOffersQuery,
  useCreateOfferMutation,
  useGetOfferByIdQuery,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useGetOffersByProjectIdQuery,
} = offersApi;
