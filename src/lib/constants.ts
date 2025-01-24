export const ROLES = {
	client: 'CLIENT',
	vendor: 'VENDOR',
	unconfirmed: 'UNCONFIRMED',
} as const;

export const THEME = {
	dark: 'dark',
	light: 'light',
};

export const VENDOR_TABS = [
	{
		key: 'dashboard',
		label: 'Dashboard',
	},
	{
		key: 'templates',
		label: 'Templates',
	},
	{
		key: 'rates',
		label: 'Rates',
	},
];

export const VENDOR_PROJECT_TABS = [
	{
		key: 'details',
		label: 'Prj details',
	},
	{
		key: 'estimation',
		label: 'Estimation',
	},
	{
		key: 'offer',
		label: 'Client’s offer',
	},
];
