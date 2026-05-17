'use client';

import React, { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClockCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';

import styles from './DashboardSidebar.module.css';

const STATUS_FILTERS = [
  { key: 'DRAFT', label: () => t('STATUS_DRAFT') },
  { key: 'PUBLISHED', label: () => t('STATUS_PUBLISHED') },
  { key: 'ARCHIVED', label: () => t('STATUS_ARCHIVED') },
] as const;

const itemClass = (isActive: boolean): string => {
  return isActive ? `${styles.sidebarItem} ${styles.sidebarItemActive}` : styles.sidebarItem;
};

export const DashboardSidebar = () => {
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
    [router]
  );

  return (
    <div className={styles.sidebarContainer}>
      <div className={itemClass(isAllProjects)} onClick={() => navigateTo()}>
        <span className={styles.itemIcon}>
          <ClockCircleOutlined />
        </span>
        {t('RECENTLY_VIEWED')}
      </div>

      <div className={itemClass(isArchiveView)} onClick={() => navigateTo({ view: 'archive' })}>
        <span className={styles.itemIcon}>
          <InboxOutlined />
        </span>
        {t('ARCHIVE')}
      </div>

      <div className={styles.separator} />

      <div className={styles.sectionLabel}>{t('BY_STATUS')}</div>

      <div className={itemClass(isAllProjects)} onClick={() => navigateTo()}>
        {t('ALL')}
      </div>

      {STATUS_FILTERS.map(({ key, label }) => (
        <div
          key={key}
          className={itemClass(currentStatus === key && !isArchiveView)}
          onClick={() => navigateTo({ status: key })}
        >
          {label()}
        </div>
      ))}
    </div>
  );
};
