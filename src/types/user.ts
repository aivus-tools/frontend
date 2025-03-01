import { GROUPS, AUTH_TYPES, ROLES } from '../lib/constants';

export type Groups = (typeof GROUPS)[keyof typeof GROUPS];
export type Roles = (typeof ROLES)[keyof typeof ROLES];
export type AuthType = (typeof AUTH_TYPES)[keyof typeof AUTH_TYPES];

export type User = {
	id: number;
	uuid: string;
	email: string;
	name: string;
	password: string | null;
	group: Groups;
	position: string | null;
	authType: AuthType;
	createdAt: string;
	updatedAt: string;
};
