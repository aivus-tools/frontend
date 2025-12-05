'use server';

import { signIn } from '@/auth/auth';
import { CALLBACK_URL } from '@/constants/apiRoute';
import { AppRoute } from '@/constants/appRoute';

export async function signInWithGoogle() {
  // Используем CALLBACK_URL если он установлен, иначе редиректим на главную
  // Middleware сам перенаправит пользователя в нужное место в зависимости от его группы
  const callbackUrl = CALLBACK_URL || AppRoute.HOME;
  await signIn('google', { callbackUrl });
}
