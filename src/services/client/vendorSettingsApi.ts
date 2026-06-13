import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import {
  SlugSuggestResponse,
  UpdateVendorSettingsPayload,
  VendorSettings,
  VendorWebhookKey,
} from '@/types/vendorSettings.interface';

export interface LogoUploadResponse {
  logoUrl: string;
}

export const vendorSettingsApi = createApi({
  reducerPath: 'vendorSettingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['VendorSettings', 'VendorWebhookKey'],
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
    suggestVendorSlug: builder.query<SlugSuggestResponse, void>({
      query: () => ApiRoute.VENDOR_SETTINGS_SLUG_SUGGEST,
    }),
    getVendorWebhookKey: builder.query<VendorWebhookKey, void>({
      query: () => ApiRoute.VENDOR_WEBHOOK_KEY,
      providesTags: ['VendorWebhookKey'],
    }),
    rotateVendorWebhookKey: builder.mutation<VendorWebhookKey, void>({
      query: () => ({
        url: ApiRoute.VENDOR_WEBHOOK_KEY_ROTATE,
        method: 'POST',
      }),
      invalidatesTags: ['VendorWebhookKey'],
    }),
  }),
});

export const {
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useUploadVendorLogoMutation,
  useLazySuggestVendorSlugQuery,
  useGetVendorWebhookKeyQuery,
  useRotateVendorWebhookKeyMutation,
} = vendorSettingsApi;
