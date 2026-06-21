import { useSession } from 'next-auth/react';
import { Groups } from '@/types/user.interface';
import { useChangeGroupMutation } from '@/services/client/userApi';
import { AppRoute } from '@/constants/appRoute';
import { clearPendingBrief, getPendingBrief } from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';

export const useChangeGroup = () => {
  const session = useSession();
  const [changeGroup, options] = useChangeGroupMutation();

  return {
    change: async (newGroup: Exclude<Groups, 'UNCONFIRMED' | 'CONFIRMED'>) => {
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

        await new Promise((x) => setTimeout(x, 1000));

        if (result.claimedBriefId) {
          clearPendingBrief();
          window.location.href = AppRoute.BRIEF_DETAIL(result.claimedBriefId);
        } else {
          // Backend auto-claim did not run (pending pointer not on the user).
          // The claim page reliably claims via the URL token, so route a fresh
          // CLIENT with a pending brief through it instead of an empty dashboard.
          const pending = newGroup === GROUPS.client ? getPendingBrief() : null;
          if (pending) {
            window.location.href = `${AppRoute.BRIEF_CLAIM(pending.briefId)}?token=${encodeURIComponent(pending.token)}`;
          } else {
            window.location.href = AppRoute.DASHBOARD;
          }
        }
      }
    },
    ...options,
  };
};
