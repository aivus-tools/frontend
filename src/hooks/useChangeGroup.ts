import { useSession } from 'next-auth/react';
import { Groups } from '@/types/user.interface.';
import { useChangeGroupMutation } from '@/services/client/userApi';
import { AppRoute } from '@/constants/appRoute';

export const useChangeGroup = () => {
  const session = useSession();
  const [changeGroup, options] = useChangeGroupMutation();

  return {
    change: async (newGroup: Omit<Groups, 'UNCONFIRMED' | 'CONFIRMED'>) => {
      if (session.data?.user?.id) {
        const result = await changeGroup({
          userId: session.data.user.id,
          newGroup,
        }).unwrap();

        await session.update({
          user: {
            ...session.data.user,
            group: result.group,
            vendorId: result.vendorId,
            clientId: result.clientId,
          },
        });

        // Ждем обновления кук
        await new Promise((resolve) => setTimeout(resolve, 1000));

        window.location.href = AppRoute.DASHBOARD;
      }
    },
    ...options,
  };
};
