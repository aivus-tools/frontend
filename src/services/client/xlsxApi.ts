import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export interface XlsxUploadResponse {
  offer_id: string;
  offer_name: string;
  share_token: string;
  has_share: boolean;
}

export const xlsxApi = createApi({
  reducerPath: 'xlsxApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    uploadXlsx: builder.mutation<XlsxUploadResponse, FormData>({
      query: (formData) => ({
        url: ApiRoute.XLSX_UPLOAD,
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const { useUploadXlsxMutation } = xlsxApi;
