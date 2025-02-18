import type { User as NextUser } from 'next-auth';
import { Roles } from './types/user';

declare module 'next-auth' {
	interface User extends NextUser {
		role?: Roles;
		accessToken?: string;
	}
}
