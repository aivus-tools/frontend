'use server';

import { signOut } from '@/auth/auth';
import { AppRoute } from '@/constants/appRoute';

export async function logout() {
  await signOut({ redirectTo: AppRoute.AUTH });
}
