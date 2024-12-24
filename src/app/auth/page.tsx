import type { Metadata } from 'next';
import { AuthForm } from './AuthForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
	title: 'Aivus Web Login',
	description: 'Aivus Web',
};

export default async function Auth() {
	const session = await auth();
	if (session) {
		redirect('/app');
	}

	return <AuthForm />;
}
