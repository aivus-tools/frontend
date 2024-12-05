'use client';
import { signup, initialFormState } from '@/app/actions/auth';
import { useActionState } from 'react';
import { EmailForm } from './EmailForm';
import { PasswordForm } from './PasswordForm';

export function ManageAuth() {
	const [state, action] = useActionState(signup, initialFormState);
	const emailError = state?.errors?.email?.join(' ');
	const passwordError = state?.errors?.email?.join(' ');

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
			return <div>Should register</div>;
		case 'exist':
			return <PasswordForm action={handlePassSubmit} error={passwordError} onResetAction={handleReset} />;
		default:
			return <EmailForm action={action} error={emailError} />;
	}
}
