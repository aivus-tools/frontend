import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Brief } from '@/types/brief.interface';
import { ApiRoute } from '@/constants/apiRoute';

export const briefApi = createApi({
  reducerPath: 'briefApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    createBrief: builder.mutation<Brief, Pick<Brief, 'details' | 'clientId' | 'status' | 'team'>>({
      query: (body) => ({
        url: ApiRoute.BRIEF_LIST,
        method: 'POST',
        body,
      }),
    }),
    updateBrief: builder.mutation<Brief, Brief>({
      query: (brief) => ({
        url: ApiRoute.BRIEF(brief.id),
        method: 'PATCH',
        body: brief,
      }),
    }),
    getBriefs: builder.query<Brief[], void>({
      query: () => ApiRoute.BRIEF_LIST,
    }),
    getBrief: builder.query<Brief, string>({
      query: (id) => ApiRoute.BRIEF(id),
    }),
  }),
});
