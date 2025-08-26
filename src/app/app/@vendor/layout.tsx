import { PropsWithChildren } from 'react';
import VendorLayout from './_components/VendorLayout/VendorLayout';

export default function Layout({ children }: PropsWithChildren) {
  return <VendorLayout>{children}</VendorLayout>;
}
