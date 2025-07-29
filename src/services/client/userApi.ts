import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Groups } from '@/types/user.interface.';
import { ApiRoute } from '@/lib/apiRoute';

type ChangeGroup = {
  userId: string;
  newGroup: Omit<Groups, 'UNCONFIRMED'>;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    changeGroup: builder.mutation<ChangeGroup, ChangeGroup>({
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
  }),
});

export const { useChangeGroupMutation, useConfirmEmailMutation } = userApi;
