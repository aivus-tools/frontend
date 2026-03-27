import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Brief, NewBrief } from '@/types/brief.interface';
import { ApiRoute } from '@/constants/apiRoute';

export const briefApi = createApi({
  reducerPath: 'briefApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['Brief'],
  endpoints: (builder) => ({
    createBrief: builder.mutation<Brief, NewBrief>({
      query: (body) => ({
        url: ApiRoute.BRIEF_LIST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Brief'],
    }),
    updateBrief: builder.mutation<Brief, Partial<Brief> & Pick<Brief, 'id'>>({
      query: (brief) => ({
        url: ApiRoute.BRIEF(brief.id),
        method: 'PATCH',
        body: brief,
      }),
      invalidatesTags: ['Brief'],
    }),
    getBriefs: builder.query<Brief[], void>({
      query: () => ApiRoute.BRIEF_LIST,
      providesTags: ['Brief'],
    }),
    getBrief: builder.query<Brief, string>({
      query: (id) => ApiRoute.BRIEF(id),
      providesTags: ['Brief'],
    }),
  }),
});

export const { useCreateBriefMutation, useUpdateBriefMutation, useGetBriefsQuery, useGetBriefQuery } = briefApi;
