'use server';
import { SignupFormSchema, FormState, PasswordSchema } from '@/app/lib/definitions';
import { signIn } from '@/auth';
import { routes } from '@/lib/service-routes';
import { checkEmail } from '@/services/authService';

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
	if (!formData) {
		return;
	}
	const email = formData.get('email');
	const password = formData.get('password');
	const validatedFields = SignupFormSchema.safeParse({ email });

	if (state?.status === 'exist') {
		await signIn('credentials', {
			email,
			password,
			callbackUrl: 'http://localhost:3000/app/dashboard',
		});
		return;
	}

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			status: 'unknown' as const,
		};
	}

	if (state?.status === 'new') {
		const name = formData.get('name');

		const validatedFields = PasswordSchema.safeParse({ password });

		if (!validatedFields.success) {
			return {
				errors: validatedFields.error.flatten().fieldErrors,
				status: 'unknown' as const,
			};
		}
		const res = await fetch(routes.REGISTER, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
				name,
			}),
		});

		if (res.ok) {
			await signIn('credentials', {
				email,
				password,
				callbackUrl: 'http://localhost:3000/app/dashboard',
			});
		}
		return;
	}

	const exist = await checkEmail({ email: email as string });

	if (!password && exist) {
		return { email: email as string, status: 'exist' as const };
	}

	return {
		email: email as string,
		status: 'new' as const,
	};
}
