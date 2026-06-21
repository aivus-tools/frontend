import type { User as NextUser, DefaultSession } from 'next-auth';
import { Groups } from '@/types/user.interface';

declare module 'next-auth' {
  interface User extends NextUser {
    group?: Groups;
    vendorId?: string;
    clientId?: string;
    isStaff?: boolean;
    emailConfirmedAt?: string | null;
  }

  interface Session {
    user: {
      id: string;
      group?: Groups;
      vendorId?: string;
      clientId?: string;
      isStaff?: boolean;
      emailConfirmedAt?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    group?: Groups;
    vendorId?: string;
    clientId?: string;
    isStaff?: boolean;
    emailConfirmedAt?: string | null;
  }
}
