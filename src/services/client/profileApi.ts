import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  company_name: string;
  position: string;
  avatar_url: string | null;
}

export interface UpdateProfilePayload {
  name: string;
  company_name: string;
  position: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}

export interface UserSettings {
  language: string;
  nda_accepted: boolean;
  email_notifications: boolean;
  browser_notifications: boolean;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Profile', 'Settings'],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ApiRoute.USER_PROFILE,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfilePayload>({
      query: (body) => ({
        url: ApiRoute.USER_PROFILE,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadAvatar: builder.mutation<AvatarUploadResponse, FormData>({
      query: (formData) => ({
        url: ApiRoute.USER_PROFILE_AVATAR,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    getSettings: builder.query<UserSettings, void>({
      query: () => ApiRoute.USER_SETTINGS,
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<UserSettings, Partial<UserSettings>>({
      query: (body) => ({
        url: ApiRoute.USER_SETTINGS,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    changePassword: builder.mutation<void, ChangePasswordPayload>({
      query: (body) => ({
        url: ApiRoute.CHANGE_PASSWORD,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useChangePasswordMutation,
} = profileApi;
