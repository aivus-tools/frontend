'use server';

import { signOut } from '@/auth/auth';

export async function logout() {
  await signOut({ redirectTo: '/auth' });
}
