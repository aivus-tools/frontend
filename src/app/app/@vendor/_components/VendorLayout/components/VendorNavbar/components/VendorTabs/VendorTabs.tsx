'use client';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { Tabs } from '@/app/app/@vendor/_components/VendorLayout/components/Tabs/Tabs';
import { VENDOR_TABS } from '@/constants/constants';

interface VendorTabsProps {
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

export const VendorTabs = (props: VendorTabsProps) => {
  const router = useRouter();
  const tab = useSelectedLayoutSegment();

  const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(`/app/${pathname}`);
    props.onNavigate?.();
  };

  return <Tabs activeKey={tab!} items={VENDOR_TABS} orientation={props.orientation} onChange={handleClick} />;
};
