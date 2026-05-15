import { PropsWithChildren } from 'react';
import { MobileStub } from '@/components/MobileStub/MobileStub';
import VendorLayout from './_components/VendorLayout/VendorLayout';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <MobileStub />
      <div className='aivus-desktop-content'>
        <VendorLayout>{children}</VendorLayout>
      </div>
    </>
  );
}
