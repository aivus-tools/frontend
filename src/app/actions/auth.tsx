import { SignupFormSchema, FormState } from '@/app/lib/definitions';
import { redirect } from 'next/navigation';

export const initialFormState: FormState = {
	errors: {},
	message: '',
	status: 'unknown',
};

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
		// get token for client
		redirect('/dashboard');
	}
	if (email === 'vendor@aivus.com' && password === 'vendor') {
		// get token for vendor
		redirect('/dashboard');
	}
	redirect('/dashboard');
}
