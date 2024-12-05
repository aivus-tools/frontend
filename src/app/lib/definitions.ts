import { z } from 'zod';

export const SignupFormSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
});

export type FormState =
	| {
			errors?: {
				email?: string[];
			};
			message?: string;
			status?: 'unknown' | 'exist' | 'new';
			email?: string;
			password?: string;
	  }
	| undefined;
