import { useSession } from 'next-auth/react';
import { Groups } from '@/types/user.interface.';
import { useChangeGroupMutation } from '@/services/client/userApi';

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
