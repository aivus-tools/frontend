import { Details } from '@/types/brief.interface';

export const initialValues: Details = {
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
