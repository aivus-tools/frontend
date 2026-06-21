'use server';

import { signIn } from '@/auth/auth';
import { CALLBACK_URL } from '@/constants/apiRoute';
import { AppRoute } from '@/constants/appRoute';

export async function signInWithGoogle() {
  // Prefer DASHBOARD over HOME to avoid a bounce through `/` — middleware then
  // routes to /app/group (role selection) or the dashboard based on the user's group.
  const callbackUrl = CALLBACK_URL || AppRoute.DASHBOARD;
  await signIn('google', { callbackUrl });
}
