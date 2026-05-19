'use client';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { Tabs } from '@/app/app/@vendor/_components/VendorLayout/components/Tabs/Tabs';
import { VENDOR_TABS } from '@/constants/constants';
import { t } from '@/lib/i18n';

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

  const items = VENDOR_TABS.map((x) => ({ key: x.key, label: t(x.labelKey) }));

  return <Tabs activeKey={tab!} items={items} orientation={props.orientation} onChange={handleClick} />;
};
