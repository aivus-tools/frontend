import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Brief } from '@/types/brief.interface';

export const briefApi = createApi({
  reducerPath: 'briefApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/service' }),
  endpoints: (builder) => ({
    createBrief: builder.mutation<Brief, Pick<Brief, 'details' | 'clientId' | 'status' | 'team'>>({
      query: (body) => ({
        url: '/briefs',
        method: 'POST',
        body,
      }),
    }),
    updateBrief: builder.mutation<Brief, Brief>({
      query: (brief) => ({
        url: `/briefs/${brief.id}`,
        method: 'PATCH',
        body: brief,
      }),
    }),
    getBriefs: builder.query<Brief[], void>({
      query: () => '/briefs',
    }),
    getBrief: builder.query<Brief, string>({
      query: (id) => `/briefs/${id}`,
    }),
  }),
});
