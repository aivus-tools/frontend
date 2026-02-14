'use client';

import React, { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchOutlined, FilterOutlined, ClockCircleOutlined, StarOutlined, InboxOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { PROJECT_STATUS } from '@/constants/constants';
import {
  SidebarContainer,
  SearchBar,
  SearchInput,
  SearchIcon,
  FilterIcon,
  Separator,
  SectionLabel,
  SidebarItem,
  ItemIcon,
} from './styled';

const STATUS_FILTERS = [
  { key: PROJECT_STATUS.DRAFT, label: () => t('DRAFTS') },
  { key: PROJECT_STATUS.RFP, label: () => t('STATUS_RFP') },
  { key: PROJECT_STATUS.REVIEWING, label: () => t('REVIEWING') },
  { key: PROJECT_STATUS.ONGOING, label: () => t('ONGOING') },
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
      {/* Search bar (placeholder - non-functional for MVP) */}
      <SearchBar>
        <SearchIcon>
          <SearchOutlined />
        </SearchIcon>
        <SearchInput placeholder={t('SEARCH')} disabled />
        <FilterIcon>
          <FilterOutlined />
        </FilterIcon>
      </SearchBar>

      {/* Quick access items */}
      <SidebarItem $active={isAllProjects} onClick={() => navigateTo()}>
        <ItemIcon>
          <ClockCircleOutlined />
        </ItemIcon>
        {t('RECENTLY_VIEWED')}
      </SidebarItem>

      <SidebarItem onClick={() => navigateTo()}>
        <ItemIcon>
          <StarOutlined />
        </ItemIcon>
        {t('FAVORITES')}
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
