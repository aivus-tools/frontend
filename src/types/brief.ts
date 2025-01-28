export type BriefStatus = 'DRAFT' | 'RFP' | 'REVIEWING' | 'ONGOING';

export interface Brief {
	status: BriefStatus;
	/** JSON stringified Details */
	details: Details;
	clientId: string;
	id: string;
	uuid: string;
	createdAt: string;
	updatedAt: string | null;
}

export interface Person {
	firstName: string;
	surname: string;
	email: string;
	position: string;
	role: string;
	description: string;
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
	territory: string;
	internalManagersAndProducers: string;
	lineProducersAndExternals: string;
	term: Term;
	mainVideoDuration: MainVideoDuration;
	cuts: Cut[];
	shootingDays: ShootingDays;
	estimationTemplate: string;
	budget: number;
	visibleForVendors: boolean;
	options?: {
		external?: Person[];
		internal?: Person[];
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
}

export interface MainVideoDuration {
	number: string;
	length: string;
	comment: string;
}

export interface Cut {
	url: string;
	comment: string;
	number: string;
	length: string;
}

export interface ShootingDays {
	number: string;
	length: string;
	comment: string;
}
