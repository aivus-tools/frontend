import type { User as NextUser } from 'next-auth';
import { Groups } from '@/types/user.interface.';

declare module 'next-auth' {
  interface User extends NextUser {
    group?: Groups;
  }
}
