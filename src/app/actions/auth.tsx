'use server';
import { SignupFormSchema, FormState } from '@/app/lib/definitions';
import { redirect } from 'next/navigation';
import { createSession } from '../lib/session';

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
	if (!formData) {
		return;
	}
	const email = formData.get('email');
	const password = formData.get('password');
	const validatedFields = SignupFormSchema.safeParse({ email });
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			status: 'unknown' as const,
		};
	}
	if (!password && (email === 'vendor@aivus.com' || email === 'client@aivus.com')) {
		return { email, status: 'exist' as const };
	}
	if (email === 'client@aivus.com' && password === 'client') {
		await createSession('client');
		redirect('/app/dashboard');
	}
	if (email === 'vendor@aivus.com' && password === 'vendor') {
		await createSession('vendor');
		redirect('/app/dashboard');
	}

	return {
		email: email as string,
		errors: { password: ['Invalid password'] },
		status: 'exist' as const,
	};
}
