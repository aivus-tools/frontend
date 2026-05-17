'use client';

import React from 'react';
import { Button } from 'antd';
import { useRouter, usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';

import styles from './ClientNavbar.module.css';

interface ClientNavbarProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

const BRIEF_TABS = [{ key: 'brief', labelKey: 'BRIEF_TAB_BRIEF' as const, suffix: '' }];

const cn = (...names: Array<string | false | null | undefined>): string => names.filter(Boolean).join(' ');

export const ClientNavbar = (props: ClientNavbarProps) => {
  const variant = props.variant ?? 'desktop';
  const isMobile = variant === 'mobile';
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();

  const isBriefPage = segments[0] === 'brief' && segments.length >= 2 && segments[1] !== 'create';
  const briefId = isBriefPage ? segments[1] : null;

  const navigate = (path: string) => {
    router.push(path);
    props.onNavigate?.();
  };

  const renderTab = (key: string, label: string, isActive: boolean, onClick: () => void) => (
    <button
      key={key}
      type='button'
      className={cn(styles.tab, isMobile && styles.tabMobile, isActive && styles.tabActive)}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className={cn(styles.wrapper, isMobile ? styles.wrapperMobile : styles.wrapperDesktop)}>
      <nav className={cn(styles.nav, isMobile && styles.navMobile)}>
        {renderTab('dashboard', t('DASHBOARD'), !isBriefPage && segments[0] === 'dashboard', () =>
          navigate('/app/dashboard')
        )}
        {isBriefPage &&
          briefId &&
          BRIEF_TABS.map((tab) => {
            const tabPath = `/app/brief/${briefId}${tab.suffix}`;
            const isActive = tab.suffix === '' ? pathname === `/app/brief/${briefId}` : pathname.startsWith(tabPath);
            return renderTab(tab.key, t(tab.labelKey), isActive, () => navigate(tabPath));
          })}
      </nav>
      <div className={cn(styles.actions, isMobile && styles.actionsMobile)}>
        <Button
          type='primary'
          className={styles.createButton}
          onClick={() => {
            navigate(AppRoute.CREATE_BRIEF);
          }}
        >
          {t('CREATE_A_BRIEF')}
        </Button>
      </div>
    </div>
  );
};
