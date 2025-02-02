import { z } from 'zod';

export const SignupFormSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
});

export const PasswordSchema = z.object({
	password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
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
