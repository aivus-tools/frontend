export const AUTH_TYPES = {
	google: 'GOOGLE',
	credentials: 'CREDENTIALS',
} as const;

export const ROLES = {
	ADMIN: 'ADMIN',
	INTERNAL: 'INTERNAL',
	EXTERNAL: 'EXTERNAL',
};

export const GROUPS = {
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
	{
		key: 'timing',
		label: 'Timing',
	},
	{
		key: 'presentation',
		label: 'Presentation',
	},
	{
		key: 'analysis',
		label: 'Analysis',
	},
];

export const NEW_BRIEF_SLUG = 'new-brief';
