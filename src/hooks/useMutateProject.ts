import { useSession } from 'next-auth/react';
import { projectsApi } from '@/services/client/projectsApi';
import { offersApi } from '@/services/client/offersApi';
import { addMonthsUTC } from '@/helpers/helper';
import { NewProject, Project } from '@/types/project.interface.';

export interface ProjectFormData {
  // Initial Parameters
  crmId?: string;
  projectName: string;
  description?: string;
  collaborators?: Array<{
    userId?: string | null;
    name: string;
    email?: string;
    role?: 'internal_user' | 'external_user';
  }>;

  // Client
  clientId?: string | null;
  clientName?: string;
  irsEin?: string;
  brandName?: string;
  managers?: Array<{
    name: string;
    position?: string;
  }>;
}

export const useMutateProject = () => {
  const session = useSession();
  const [createProject, { isLoading: isCreatingProject }] = projectsApi.useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdatingProject }] = projectsApi.useUpdateProjectMutation();
  const [createOffer, { isLoading: isCreatingOffer }] = offersApi.useCreateOfferMutation();

  return {
    isLoading: isCreatingProject || isUpdatingProject || isCreatingOffer,

    create: async (formData: ProjectFormData) => {
      const vendorId = session.data?.user?.vendorId;

      if (!vendorId) {
        throw new Error('Vendor ID not found');
      }

      console.log('Creating project with data:', formData);

      // Build project payload
      const projectPayload: NewProject = {
        name: formData.projectName || 'New Project',
        vendorId,
        status: 'DRAFT',
        crmId: formData.crmId || '',
        description: formData.description || '',
        clientId: formData.clientId || null,
        irsEin: formData.irsEin || '',
        brandName: formData.brandName || '',
        collaborators: formData.collaborators?.filter((c) => c.name).map((c) => ({
          userId: c.userId || null,
          name: c.name,
          email: c.email || '',
          role: c.role || 'internal_user',
        })) || [],
        clientManagers: formData.managers?.filter((m) => m.name).map((m) => ({
          name: m.name,
          position: m.position || '',
        })) || [],
      };

      // Step 1: Create Project (without Brief!)
      const project = await createProject(projectPayload).unwrap();

      console.log('Project created:', project);

      // Step 2: Create Offer
      const offer = await createOffer({
        projectName: formData.projectName || 'New Project',
        projectId: project.id,
        status: 'DRAFT',
        details: {},
        deadline: addMonthsUTC(new Date(), 2).toISOString(),
        source: 'PLATFORM',
        isLocked: false,
        cost: null,
        profit: null,
      }).unwrap();

      console.log('Offer created:', offer);

      // Return project ID for navigation
      return { projectId: project.id, project, offer };
    },

    update: async (projectId: string, formData: Partial<ProjectFormData>) => {
      // Build update payload - use Record type to allow flexible structure
      const updatePayload: Record<string, unknown> & { id: string } = {
        id: projectId,
      };

      if (formData.projectName !== undefined) {
        updatePayload.name = formData.projectName;
      }
      if (formData.crmId !== undefined) {
        updatePayload.crmId = formData.crmId;
      }
      if (formData.description !== undefined) {
        updatePayload.description = formData.description;
      }
      if (formData.clientId !== undefined) {
        updatePayload.clientId = formData.clientId;
      }
      if (formData.irsEin !== undefined) {
        updatePayload.irsEin = formData.irsEin;
      }
      if (formData.brandName !== undefined) {
        updatePayload.brandName = formData.brandName;
      }
      if (formData.collaborators !== undefined) {
        updatePayload.collaborators = formData.collaborators.filter((c) => c.name).map((c) => ({
          userId: c.userId || null,
          name: c.name,
          email: c.email || '',
          role: c.role || 'internal_user',
        }));
      }
      if (formData.managers !== undefined) {
        updatePayload.clientManagers = formData.managers.filter((m) => m.name).map((m) => ({
          name: m.name,
          position: m.position || '',
        }));
      }

      await updateProject(updatePayload as Partial<Project> & { id: string }).unwrap();
    },
  };
};
