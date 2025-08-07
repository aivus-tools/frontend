import { PropsWithChildren } from 'react';
import VendorLayout from './_components/layout';

export default function Layout({ children }: PropsWithChildren) {
  return <VendorLayout>{children}</VendorLayout>;
}
