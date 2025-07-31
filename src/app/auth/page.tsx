import type { Metadata } from 'next';
import { AuthForm } from './_components/AuthForm/AuthForm';
import { AuthTypeProvider } from '@/context/AuthTypeProvider';

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
