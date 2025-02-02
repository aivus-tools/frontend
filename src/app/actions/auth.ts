'use server';

import { SignupFormSchema, FormState } from '@/app/lib/definitions';
import { signIn } from '@/auth';
import logger from '@/lib/logger';
import { CALLBACK_URL } from '@/lib/service-routes';
import { checkEmail, register } from '@/services/authService';

export async function signup(state: FormState, formData: FormData): Promise<FormState | undefined> {
	try {
		if (!formData) {
			throw new Error('FormData is required');
		}

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		if (!email) {
			throw new Error('Email is required');
		}

		const validatedFields = SignupFormSchema.safeParse({ email });
		if (!validatedFields.success) {
			return {
				errors: validatedFields.error.flatten().fieldErrors,
				status: 'unknown',
			};
		}

		if (state?.status === 'exist') {
			await signIn('credentials', { email, password, callbackUrl: CALLBACK_URL });
			return;
		}

		if (state?.status === 'new') {
			const name = formData.get('name') as string;
			if (!name) {
				throw new Error('Name is required for new users');
			}

			const isRegistered = await register({ name, email, authType: 'CREDENTIALS' });
			if (isRegistered) {
				await signIn('credentials', { email, password, callbackUrl: CALLBACK_URL });
				return;
			}
		}

		const userExists = await checkEmail({ email });
		if (!password && userExists) {
			return { email, status: 'exist' };
		}

		return { email, status: 'new' };
	} catch (error) {
		logger.error('Error signing up:', error);
		return {
			errors: { general: `An unexpected error occurred ${JSON.stringify(error)}` },
			status: 'unknown',
		};
	}
}
