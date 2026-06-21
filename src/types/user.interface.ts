import { GROUPS, AUTH_TYPES, ROLES } from '@/constants/constants';

export type Groups = (typeof GROUPS)[keyof typeof GROUPS];
export type Roles = (typeof ROLES)[keyof typeof ROLES];
export type AuthType = (typeof AUTH_TYPES)[keyof typeof AUTH_TYPES];

export type User = {
  id: string;
  uuid: string;
  email: string;
  name: string;
  password: string | null;
  group: Groups;
  position: string | null;
  authType: AuthType;
  vendorId?: string;
  clientId?: string;
  isStaff?: boolean;
  emailConfirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
