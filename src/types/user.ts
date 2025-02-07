import { ROLES, AUTH_TYPES } from '../lib/constants';

export type Roles = (typeof ROLES)[keyof typeof ROLES];
export type AuthTypes = (typeof AUTH_TYPES)[keyof typeof AUTH_TYPES];

export type User = {
	id: number;
	uuid: string;
	email: string;
	name: string;
	password: string | null;
	group: Roles;
	position: string | null;
	authType: AuthTypes;
	createdAt: string;
	updatedAt: string;
};
