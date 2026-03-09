import { auth } from '@/auth/auth';
import { redirect } from 'next/navigation';
import { ReduxStore } from '@/context/ReduxProvider';
import React from 'react';

export default async function ExportLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth');
    return null;
  }

  return <ReduxStore>{children}</ReduxStore>;
}
