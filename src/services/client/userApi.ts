import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Groups, User } from '@/types/user.interface';
import { ApiRoute } from '@/constants/apiRoute';

type ChangeGroup = {
  userId: string;
  newGroup: Exclude<Groups, 'UNCONFIRMED'>;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    changeGroup: builder.mutation<Partial<User> & { claimedBriefId?: string }, ChangeGroup>({
      query: ({ userId, newGroup }) => ({
        url: ApiRoute.CHANGE_ROLE(userId),
        method: 'PATCH',
        body: { group: newGroup },
      }),
    }),
    resendConfirmation: builder.mutation<{ message: string }, string>({
      query: (email) => ({
        url: ApiRoute.RESEND_CONFIRMATION,
        method: 'POST',
        body: { email },
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, string>({
      query: (email) => ({
        url: ApiRoute.FORGOT_PASSWORD,
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `${ApiRoute.RESET_PASSWORD}?token=${encodeURIComponent(token)}`,
        method: 'POST',
        body: { password },
      }),
    }),
  }),
});

export const {
  useChangeGroupMutation,
  useResendConfirmationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userApi;
