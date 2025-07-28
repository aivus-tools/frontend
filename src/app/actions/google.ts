'use server';

import { signIn } from '@/auth';
import { CALLBACK_URL } from '@/lib/service-routes';

export async function signInWithGoogle() {
  await signIn('google', { callbackUrl: CALLBACK_URL });
}
