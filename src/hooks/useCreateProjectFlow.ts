/**
 * Hook for creating the full project flow: Brief → Project → Offer
 * This replaces the old flow where Brief had team FK
 */

import { useSession } from 'next-auth/react';
import { Details } from '@/types/brief.interface';
import { briefApi } from '@/services/client/briefApi';
import { projectsApi } from '@/services/client/projectsApi';
import { offersApi } from '@/services/client/offersApi';
import { addMonthsUTC } from '@/helpers/helper';

export const useCreateProjectFlow = () => {
  const session = useSession();
  const [createBrief] = briefApi.useCreateBriefMutation();
  const [createProject] = projectsApi.useCreateProjectMutation();
  const [createOffer] = offersApi.useCreateOfferMutation();

  const createFullProject = async (details: Details) => {
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
      cost: 0,
      profit: 0,
    }).unwrap();

    return { brief, project, offer };
  };

  return { createFullProject };
};
