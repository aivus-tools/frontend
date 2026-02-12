import { ProjectFormData } from '@/hooks/useMutateProject';

// Initial values for Project form (new structure without Brief fields)
export const initialValues: ProjectFormData = {
  // Initial Parameters
  crmId: '',
  projectName: '',
  description: '',
  collaborators: [],

  // Client
  clientId: null,
  clientName: '',
  irsEin: '',
  brandName: '',
  managers: [
    {
      name: '',
      position: '',
    },
  ],
};

// Keep old Details type values for backwards compatibility (Brief form)
// This will be used when Brief form is reactivated for Client usage
export const briefInitialValues = {
  brandName: '',
  projectDescription: '',
  estimationTemplate: '',
  visibleForVendors: false,
  projectName: '',
  collaborators: [''],
  managers: [
    {
      manager: '',
      position: '',
    },
  ],
  referenceVideos: [
    {
      url: '',
      comment: '',
    },
  ],
  distributionAndAdPlacements: '',
  territory: ['US', 'CA'],
  term: {
    length: '',
    unit: '',
  },
  mainVideoDuration: {
    number: '',
    length: '',
    timeUnit: '',
    comment: '',
  },
  cuts: [
    {
      timeUnit: '',
      number: '',
      length: '',
      comment: '',
    },
  ],
  shootingDays: {
    number: '',
    length: '',
    comment: '',
    timeUnit: '',
  },
  crmId: '',
  clientName: '',
  description: '',
  irsEin: '',
  options: {
    collaborators: [],
  },
};
