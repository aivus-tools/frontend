import type { Metadata } from 'next';
import { AuthForm } from './AuthForm';

export const metadata: Metadata = {
	title: 'Aivus Web Login',
	description: 'Aivus Web',
};

export default async function Auth() {
	return <AuthForm />;
}
