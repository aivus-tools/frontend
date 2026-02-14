'use server';

import { signIn } from '@/auth/auth';
import { CALLBACK_URL } from '@/constants/apiRoute';
import { AppRoute } from '@/constants/appRoute';

export async function signInWithGoogle() {
  // Use CALLBACK_URL if set, otherwise redirect to home
  // Middleware will redirect the user to the correct page based on their group
  const callbackUrl = CALLBACK_URL || AppRoute.HOME;
  await signIn('google', { callbackUrl });
}
