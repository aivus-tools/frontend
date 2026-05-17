'use client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { VendorTabs } from './components/VendorTabs/VendorTabs';
import { NEW_BRIEF_SLUG } from '@/constants/constants';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';

import styles from './VendorNavbar.module.css';

export const VendorNavbar = () => {
  const router = useRouter();

  const detailsPath = AppRoute.DASHBOARD_PROJECT_DETAILS(NEW_BRIEF_SLUG);

  useEffect(() => {
    router.prefetch(detailsPath);
  }, [detailsPath, router]);

  const handleNewEstimation = () => {
    router.push(detailsPath);
  };

  return (
    <div className={styles.navbar}>
      <VendorTabs />
      <div className={styles.actions}>
        <Button type='primary' onClick={handleNewEstimation}>
          {t('NEW_ESTIMATION')}
        </Button>
      </div>
    </div>
  );
};
