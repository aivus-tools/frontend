import { PROJECT_STATUS } from '@/constants/constants';

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

// Backend Project model
export interface Project {
  id: string;
  name: string;
  vendorId: string;
  briefId?: string | null;
  teamId?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string | null;
}

export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

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
