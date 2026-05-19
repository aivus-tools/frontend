'use client';
import { useRouter, useSelectedLayoutSegments, useSearchParams } from 'next/navigation';
import { Tabs } from '@/app/app/@vendor/_components/VendorLayout/components/Tabs/Tabs';
import { VENDOR_PROJECT_TABS, VENDOR_PROJECT_TAB_KEYS, NEW_BRIEF_SLUG } from '@/constants/constants';
import React, { useMemo } from 'react';

interface ProjectTabsProps {
  fullWidth?: boolean;
}

export const ProjectTabs = (props: ProjectTabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, projectId, tab] = useSelectedLayoutSegments();

  const isNewProject = projectId === NEW_BRIEF_SLUG;

  const visibleTabs = useMemo(
    () =>
      isNewProject ? VENDOR_PROJECT_TABS.filter((t) => t.key === VENDOR_PROJECT_TAB_KEYS.DETAILS) : VENDOR_PROJECT_TABS,
    [isNewProject]
  );

  const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const offerId = searchParams.get('offer');
    const url = offerId ? `${pathname}?offer=${offerId}` : pathname;
    router.push(url);
  };

  return <Tabs activeKey={tab} items={visibleTabs} onChange={handleClick} fullWidth={props.fullWidth} />;
};
