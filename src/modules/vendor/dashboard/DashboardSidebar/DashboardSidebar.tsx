'use client';

import React, { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClockCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import {
  SidebarContainer,
  Separator,
  SectionLabel,
  SidebarItem,
  ItemIcon,
} from './styled';

const STATUS_FILTERS = [
  { key: 'DRAFT', label: () => t('STATUS_DRAFT') },
  { key: 'PUBLISHED', label: () => t('STATUS_PUBLISHED') },
  { key: 'ARCHIVED', label: () => t('STATUS_ARCHIVED') },
] as const;

export const DashboardSidebar: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentView = searchParams.get('view');
  const currentStatus = searchParams.get('status');
  const isArchiveView = currentView === 'archive';
  const isAllProjects = !currentView && !currentStatus;

  const navigateTo = useCallback(
    (params?: Record<string, string>) => {
      if (!params) {
        router.push('/app/dashboard');
        return;
      }
      const sp = new URLSearchParams(params);
      router.push(`/app/dashboard?${sp.toString()}`);
    },
    [router],
  );

  return (
    <SidebarContainer>
      {/* Quick access items */}
      <SidebarItem $active={isAllProjects} onClick={() => navigateTo()}>
        <ItemIcon>
          <ClockCircleOutlined />
        </ItemIcon>
        {t('RECENTLY_VIEWED')}
      </SidebarItem>

      <SidebarItem $active={isArchiveView} onClick={() => navigateTo({ view: 'archive' })}>
        <ItemIcon>
          <InboxOutlined />
        </ItemIcon>
        {t('ARCHIVE')}
      </SidebarItem>

      <Separator />

      {/* Status filters */}
      <SectionLabel>{t('BY_STATUS')}</SectionLabel>

      <SidebarItem
        $active={isAllProjects}
        onClick={() => navigateTo()}
      >
        {t('ALL')}
      </SidebarItem>

      {STATUS_FILTERS.map(({ key, label }) => (
        <SidebarItem
          key={key}
          $active={currentStatus === key && !isArchiveView}
          onClick={() => navigateTo({ status: key })}
        >
          {label()}
        </SidebarItem>
      ))}
    </SidebarContainer>
  );
};
