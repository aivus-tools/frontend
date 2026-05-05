import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import { PreVendorLanguage, PreVendorsResponse } from '@/types/preVendor.interface';

export const preVendorsApi = createApi({
  reducerPath: 'preVendorsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['PreVendors'],
  endpoints: (builder) => ({
    getPreVendors: builder.query<PreVendorsResponse, { language: PreVendorLanguage }>({
      query: (args) => ({
        url: `${ApiRoute.PRE_VENDORS}?language=${args.language}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, args) => [{ type: 'PreVendors', id: args.language }],
    }),
  }),
});

export const { useGetPreVendorsQuery } = preVendorsApi;
