'use client';
import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { Tabs } from '../../../Tabs/Tabs';
import { VENDOR_PROJECT_TABS, VENDOR_PROJECT_TAB_KEYS, NEW_BRIEF_SLUG } from '@/constants/constants';
import React, { useMemo } from 'react';

export const ProjectTabs = () => {
  const router = useRouter();
  const [, projectId, tab] = useSelectedLayoutSegments();

  const isNewProject = projectId === NEW_BRIEF_SLUG;

  const visibleTabs = useMemo(
    () =>
      isNewProject
        ? VENDOR_PROJECT_TABS.filter((t) => t.key === VENDOR_PROJECT_TAB_KEYS.DETAILS)
        : VENDOR_PROJECT_TABS,
    [isNewProject]
  );

  const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(pathname);
  };

  return <Tabs activeKey={tab} items={visibleTabs} onChange={handleClick} />;
};
