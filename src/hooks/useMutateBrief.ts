import { useSession } from 'next-auth/react';
import { Brief, Details } from '@/types/brief.interface';
import { ROLES } from '@/constants/constants';
import { briefApi } from '@/services/client/briefApi';

export const { useCreateBriefMutation, useUpdateBriefMutation } = briefApi;

export const useMutateBrief = () => {
  const session = useSession();
  const [createBrief, { isLoading: isCreating }] = useCreateBriefMutation();
  const [updateBrief, { isLoading: isUpdating }] = useUpdateBriefMutation();

  return {
    isLoading: isCreating || isUpdating,
    create: async (details: Details) => {
      if (session.data?.user?.id) {
        return await createBrief({
          status: 'DRAFT',
          details,
          clientId: Number(session.data.user.id),
          team: [
            {
              role: ROLES.ADMIN,
              userId: Number(session.data.user.id) as unknown as number,
            },
          ],
        }).unwrap();
      }
    },
    update: async (brief: Brief) => {
      await updateBrief(brief).unwrap();
    },
  };
};
