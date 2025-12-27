import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Groups, User } from '@/types/user.interface.';
import { ApiRoute } from '@/constants/apiRoute';

type ChangeGroup = {
  userId: string;
  newGroup: Omit<Groups, 'UNCONFIRMED'>;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    changeGroup: builder.mutation<Partial<User>, ChangeGroup>({
      query: ({ userId, newGroup }) => ({
        url: ApiRoute.USER_CHANGE_GROUP(userId),
        method: 'PATCH',
        body: { newGroup },
      }),
    }),
    confirmEmail: builder.mutation<void, string>({
      query: (token) => ({
        url: ApiRoute.CONFIRM_EMAIL(token),
        method: 'GET',
      }),
    }),
    resendConfirmation: builder.mutation<{ message: string }, string>({
      query: (email) => ({
        url: ApiRoute.RESEND_CONFIRMATION_SERVICE,
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const { useChangeGroupMutation, useConfirmEmailMutation, useResendConfirmationMutation } = userApi;
