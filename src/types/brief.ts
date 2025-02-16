import { Roles } from './user';

export type BriefStatus = 'DRAFT' | 'RFP' | 'REVIEWING' | 'ONGOING';

export interface Brief {
	status: BriefStatus;
	/** JSON stringified Details */
	details: Details;
	clientId: number;
	team: Team[];
	id: string;
	uuid: string;
	createdAt: string;
	updatedAt: string | null;
}

export interface Team {
	userId: number;
	role: Roles;
}

export interface Person {
	firstName: string;
	surname: string;
	email: string;
	position: string;
	role: 'admin' | 'internal_user' | 'external_user';
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
