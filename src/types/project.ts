import { PROJECT_STATUS } from '@/lib/constants';

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export interface Project {
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
