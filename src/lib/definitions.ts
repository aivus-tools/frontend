import { z } from 'zod';
import { t } from '@/lib/i18n';

export const SignupFormSchema = z.object({
  email: z
    .string()
    .email({ message: t('PLEASE_ENTER_VALID_EMAIL') })
    .trim(),
});

export const PasswordSchema = z.object({
  password: z.string().min(8, { message: t('PASSWORD_MIN_LENGTH') }),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        general?: string;
      };
      message?: string;
      status?: 'unknown' | 'exist' | 'new';
      email?: string;
      password?: string;
      name?: string;
    }
  | undefined;
