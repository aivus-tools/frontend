import { PROJECT_STATUS } from '@/constants/constants';

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export interface ProjectCollaborator {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  role: 'internal_user' | 'external_user';
}

export interface ClientManager {
  id?: string;
  name: string;
  position: string;
}

// Backend Project model
export interface Project {
  id: string;
  name: string;
  vendorId: string;
  briefId?: string | null;
  teamId?: string | null;
  status: ProjectStatus;
  // New fields
  crmId?: string;
  description?: string;
  clientId?: string | null;
  clientName?: string | null;
  irsEin?: string;
  brandName?: string;
  thumbnailUrl?: string | null;
  collaborators?: ProjectCollaborator[];
  clientManagers?: ClientManager[];
  createdAt: string;
  updatedAt: string | null;
}

export interface NewProjectCollaborator {
  userId?: string | null;
  name: string;
  email?: string;
  role?: 'internal_user' | 'external_user';
}

export interface NewClientManager {
  name: string;
  position?: string;
}

export interface NewProject {
  name: string;
  vendorId: string;
  status?: ProjectStatus;
  briefId?: string | null;
  teamId?: string | null;
  crmId?: string;
  description?: string;
  clientId?: string | null;
  irsEin?: string;
  brandName?: string;
  collaborators?: NewProjectCollaborator[];
  clientManagers?: NewClientManager[];
}

// UI Project representation (for dashboard list)
export interface ProjectListItem {
  id: string;
  title: string;
  assignee: string;
  clientName: string;
  clientContact: string;
  status: ProjectStatus;
  cost: string;
  expenses: string;
  profit: string;
  deadline: string;
  createdAt: string;
}
