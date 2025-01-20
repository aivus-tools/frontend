import { ROLES } from '../lib/constants';

export type Roles = (typeof ROLES)[keyof typeof ROLES];

export type User = {
	id: string;
	email: string;
	name: string;
	role: Roles;
	isExternal: boolean;
	createdAt: string;
	updatedAt: string;
};
