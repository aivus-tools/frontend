import { ROLES } from './constants';

export type Roles = (typeof ROLES)[keyof typeof ROLES];

export type User = {
	id: number;
	email: string;
	name: string;
	role: Roles;
	isExternal: boolean;
	createdAt: string;
	updatedAt: string;
};
