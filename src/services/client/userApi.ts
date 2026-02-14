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
    changeGroup: builder.mutation<Partial<User>, ChangeGroup>({
      query: ({ userId, newGroup }) => ({
        url: ApiRoute.CHANGE_ROLE(userId),
        method: 'PATCH',
        body: { group: newGroup },
      }),
    }),
    confirmEmail: builder.query<void, string>({
      query: (token) => ApiRoute.CONFIRM_EMAIL(token),
    }),
    resendConfirmation: builder.mutation<{ message: string }, string>({
      query: (email) => ({
        url: ApiRoute.RESEND_CONFIRMATION,
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const { useChangeGroupMutation, useLazyConfirmEmailQuery, useResendConfirmationMutation } = userApi;
