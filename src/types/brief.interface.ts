import { ProjectStatus } from './project.interface';
import { Roles } from './user.interface';

export interface Brief {
  id: string;
  uuid: string;
  status: ProjectStatus;
  details: Details;
  structuredData?: Record<string, unknown> | null;
  clientId?: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export type NewBrief = Omit<Brief, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>;

export interface Team {
  userId: string;
  role: Roles;
}

export interface Person {
  firstName: string;
  surname: string;
  email: string;
  position: string;
  role: 'admin' | 'internal_user' | 'external_user' | 'producer' | 'agency_producer';
}

export interface Details {
  crmId: string;
  clientName: string;
  projectName: string;
  description: string;
  irsEin: string;
  brandName: string;
  managers: Manager[];
  projectDescription: string;
  referenceVideos: ReferenceVideo[];
  distributionAndAdPlacements: string;
  territory: string[];
  collaborators: string[];
  term: Term;
  mainVideoDuration: MainVideoDuration;
  cuts: Cut[];
  shootingDays: ShootingDays;
  estimationTemplate: string;
  budget?: number;
  visibleForVendors: boolean;
  options?: {
    collaborators?: Person[];
  };
}

export interface Manager {
  manager: string;
  position: string;
}

export interface ReferenceVideo {
  url: string;
  comment: string;
}

export interface Term {
  length: string;
  unit: string;
}

export interface MainVideoDuration {
  number: string;
  length: string;
  timeUnit: string;
  comment: string;
}

export interface Cut {
  timeUnit: string;
  comment: string;
  number: string;
  length: string;
}

export interface ShootingDays {
  number: string;
  length: string;
  comment: string;
  timeUnit: string;
}
