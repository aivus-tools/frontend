'use client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { VendorTabs } from './components/VendorTabs/VendorTabs';
import { NEW_BRIEF_SLUG } from '@/constants/constants';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';

import styles from './VendorNavbar.module.css';

interface VendorNavbarProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export const VendorNavbar = (props: VendorNavbarProps) => {
  const variant = props.variant ?? 'desktop';
  const isMobile = variant === 'mobile';
  const router = useRouter();

  const detailsPath = AppRoute.DASHBOARD_PROJECT_DETAILS(NEW_BRIEF_SLUG);

  useEffect(() => {
    router.prefetch(detailsPath);
  }, [detailsPath, router]);

  const handleNewEstimation = () => {
    router.push(detailsPath);
    props.onNavigate?.();
  };

  const wrapperClass = isMobile ? `${styles.navbar} ${styles.navbarMobile}` : styles.navbar;
  const actionsClass = isMobile ? `${styles.actions} ${styles.actionsMobile}` : styles.actions;

  return (
    <div className={wrapperClass}>
      <VendorTabs orientation={isMobile ? 'vertical' : 'horizontal'} onNavigate={props.onNavigate} />
      <div className={actionsClass}>
        {/* <Button type='primary' block={isMobile} onClick={handleNewEstimation}>
          {t('NEW_ESTIMATION')}
        </Button> */}
      </div>
    </div>
  );
};
