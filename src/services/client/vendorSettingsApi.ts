import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import { VendorSettings, UpdateVendorSettingsPayload } from '@/types/vendorSettings.interface';

export interface LogoUploadResponse {
  logoUrl: string;
}

export const vendorSettingsApi = createApi({
  reducerPath: 'vendorSettingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['VendorSettings'],
  endpoints: (builder) => ({
    getVendorSettings: builder.query<VendorSettings, void>({
      query: () => ApiRoute.VENDOR_SETTINGS,
      providesTags: ['VendorSettings'],
    }),
    updateVendorSettings: builder.mutation<VendorSettings, UpdateVendorSettingsPayload>({
      query: (body) => ({
        url: ApiRoute.VENDOR_SETTINGS,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['VendorSettings'],
    }),
    uploadVendorLogo: builder.mutation<LogoUploadResponse, FormData>({
      query: (formData) => ({
        url: ApiRoute.VENDOR_SETTINGS_LOGO,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['VendorSettings'],
    }),
  }),
});

export const {
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useUploadVendorLogoMutation,
} = vendorSettingsApi;
