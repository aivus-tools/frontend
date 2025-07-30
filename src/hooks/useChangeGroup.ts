import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useSession } from 'next-auth/react';
import { Groups } from '@/types/user';

type ChangeGroup = {
  userId: string;
  newGroup: Omit<Groups, 'UNCONFIRMED'>;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/service' }),
  endpoints: (builder) => ({
    changeGroup: builder.mutation<ChangeGroup, ChangeGroup>({
      query: ({ userId, newGroup }) => ({
        url: `/users/${userId}/change-group`,
        method: 'PATCH',
        body: { newGroup },
      }),
    }),
    confirmEmail: builder.mutation<void, string>({
      query: (token) => ({
        url: `/auth/confirm-email?token=${token}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useChangeGroupMutation, useConfirmEmailMutation } = userApi;

export const useChangeGroup = () => {
  const session = useSession();
  const [changeGroup, options] = useChangeGroupMutation();

  return {
    change: async (newGroup: Omit<Groups, 'UNCONFIRMED' | 'CONFIRMED'>) => {
      if (session.data?.user?.id) {
        await changeGroup({
          userId: session.data.user.id,
          newGroup,
        }).unwrap();
        await session.update();
        window.location.href = `/app/dashboard`;
      }
    },
    ...options,
  };
};
