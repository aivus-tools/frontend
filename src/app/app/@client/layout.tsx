import { PropsWithChildren } from 'react';
import ClientLayout from './_components/ClientLayout/ClientLayout';

export default function Layout({ children }: PropsWithChildren) {
  return <ClientLayout>{children}</ClientLayout>;
}
