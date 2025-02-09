import { Details } from '@/types/brief';

export const initialValues: Details = {
	brandName: '',
	projectDescription: '',
	estimationTemplate: '',
	visibleForVendors: false,
	projectName: '',
	collaborators: [{ person: '' }],
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
	budget: 0,
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
};
