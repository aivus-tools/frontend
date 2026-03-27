import { useSession } from 'next-auth/react';
import { projectsApi } from '@/services/client/projectsApi';
import { offersApi } from '@/services/client/offersApi';
import { addMonthsUTC } from '@/helpers/helper';
import { NewProject, Project } from '@/types/project.interface';

export interface ProjectFormData {
  // Initial Parameters
  crmId?: string;
  projectName: string;
  description?: string;
  estimationTemplate?: string;
  collaborators?: Array<{
    userId?: string | null;
    name: string;
    email?: string;
    role?: 'internal_user' | 'external_user' | 'producer' | 'agency_producer';
  }>;

  // Client
  clientId?: string | null;
  clientName?: string;
  irsEin?: string;
  brandName?: string;
  agencyName?: string;
  managers?: Array<{
    name: string;
    position?: string;
  }>;

  // Thumbnail (File object from Uploader, not sent in JSON payload)
  previewImage?: File | null;
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

      // Build project payload
      const projectPayload: NewProject = {
        name: formData.projectName || 'New Project',
        vendorId,
        status: 'DRAFT',
        crmId: formData.crmId || '',
        description: formData.description || '',
        clientId: formData.clientId || null,
        clientName: formData.clientName || '',
        irsEin: formData.irsEin || '',
        brandName: formData.brandName || '',
        agencyName: formData.agencyName || '',
        collaborators: formData.collaborators?.filter((c) => c.name || c.email).map((c) => ({
          userId: c.userId || null,
          name: c.name || c.email || '',
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

      // Step 2: Create Offer (skip if template selected - template_apply creates its own)
      let offer = null;
      if (!formData.estimationTemplate) {
        offer = await createOffer({
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
      }

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
      if (formData.clientName !== undefined) {
        updatePayload.clientName = formData.clientName;
      }
      if (formData.irsEin !== undefined) {
        updatePayload.irsEin = formData.irsEin;
      }
      if (formData.brandName !== undefined) {
        updatePayload.brandName = formData.brandName;
      }
      if (formData.agencyName !== undefined) {
        updatePayload.agencyName = formData.agencyName;
      }
      if (formData.collaborators !== undefined) {
        updatePayload.collaborators = formData.collaborators.filter((c) => c.name || c.email).map((c) => ({
          userId: c.userId || null,
          name: c.name || c.email || '',
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
