'use server';

import { signIn } from '@/auth/auth';
import { CALLBACK_URL } from '@/lib/apiRoute';

export async function signInWithGoogle() {
  await signIn('google', { callbackUrl: CALLBACK_URL });
}
