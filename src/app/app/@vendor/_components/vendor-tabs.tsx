'use client';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { Tabs } from './tabs';
import { VENDOR_TABS } from '@/lib/constants';

export const VendorTabs = () => {
  const router = useRouter();
  const tab = useSelectedLayoutSegment();

  const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(`/app/${pathname}`);
  };

  return <Tabs activeKey={tab!} items={VENDOR_TABS} onChange={handleClick} />;
};
