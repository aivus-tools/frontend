import type { Metadata } from 'next';
import { AuthForm } from './AuthForm';
import { AuthTypeProvider } from './context/auth-type';

export const metadata: Metadata = {
  title: 'Aivus Web Login',
  description: 'Aivus Web',
};

export default async function Auth() {
  return (
    <AuthTypeProvider>
      <AuthForm />
    </AuthTypeProvider>
  );
}
