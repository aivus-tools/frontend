'use client';
import { signup } from '@/app/actions/auth';
import { useActionState } from 'react';
import { EmailForm } from './EmailForm';
import { PasswordForm } from './PasswordForm';
import { FormState } from '@/app/lib/definitions';
import { RegisterForm } from './RegisterForm';

const initialFormState: FormState = {
	errors: {},
	message: '',
	status: 'unknown',
};

export function ManageAuth() {
	const [state, action] = useActionState(signup, initialFormState);
	const emailError = state?.errors?.email?.join(' ');
	const passwordError = state?.errors?.password?.join(' ');

	const handlePassSubmit = (formData: FormData) => {
		if (state?.email) {
			formData.append('email', state.email);
			action(formData);
		}
	};

	const handleReset = () => {
		action(undefined!);
	};

	switch (state?.status) {
		case 'new':
			return <RegisterForm action={handlePassSubmit} error={emailError} onResetAction={handleReset} />;
		case 'exist':
			return <PasswordForm action={handlePassSubmit} error={passwordError} onResetAction={handleReset} />;
		default:
			return <EmailForm action={action} error={emailError} />;
	}
}
