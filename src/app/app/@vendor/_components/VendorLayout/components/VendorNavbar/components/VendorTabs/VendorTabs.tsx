'use client';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { Tabs } from '@/app/app/@vendor/_components/VendorLayout/components/Tabs/Tabs';
import { VENDOR_TABS } from '@/constants/constants';

export const VendorTabs = () => {
  const router = useRouter();
  const tab = useSelectedLayoutSegment();

  const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(`/app/${pathname}`);
  };

  return <Tabs activeKey={tab!} items={VENDOR_TABS} onChange={handleClick} />;
};
