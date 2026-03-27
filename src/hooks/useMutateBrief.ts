import { useSession } from 'next-auth/react';
import { Brief, Details } from '@/types/brief.interface';
import { briefApi } from '@/services/client/briefApi';
import { projectsApi } from '@/services/client/projectsApi';
import { offersApi } from '@/services/client/offersApi';
import { addMonthsUTC } from '@/helpers/helper';

export const { useCreateBriefMutation, useUpdateBriefMutation } = briefApi;

export const useMutateBrief = () => {
  const session = useSession();
  const [createBrief, { isLoading: isCreating }] = useCreateBriefMutation();
  const [updateBrief, { isLoading: isUpdating }] = useUpdateBriefMutation();
  const [createProject] = projectsApi.useCreateProjectMutation();
  const [createOffer] = offersApi.useCreateOfferMutation();

  return {
    isLoading: isCreating || isUpdating,
    create: async (details: Details) => {
      const userId = session.data?.user?.id;
      const vendorId = session.data?.user?.vendorId;

      if (!userId || !vendorId) {
        throw new Error('User or vendor ID not found');
      }

      // Step 1: Create Brief
      const brief = await createBrief({
        status: 'DRAFT',
        details,
        clientId: null, // No client yet for vendor-initiated flow
      }).unwrap();

      // Step 2: Create Project
      const project = await createProject({
        name: details.projectName || 'New Project',
        vendorId,
        briefId: brief.id,
        status: 'DRAFT',
      }).unwrap();

      // Step 3: Create Offer
      const offer = await createOffer({
        projectName: details.projectName || 'New Project',
        projectId: project.id,
        status: 'DRAFT',
        details: {},
        deadline: addMonthsUTC(new Date(), 2).toISOString(),
        source: 'PLATFORM',
        isLocked: false,
        cost: null,
        profit: null,
      }).unwrap();

      // Return project ID for navigation
      return { projectId: project.id, brief, project, offer };
    },
    update: async (brief: Brief) => {
      await updateBrief(brief).unwrap();
    },
  };
};
