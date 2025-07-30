'use client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { VendorTabs } from './vendor-tabs';
import { NEW_BRIEF_SLUG } from '@/constants/constants';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';

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
    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <VendorTabs />
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button type='primary' onClick={handleNewEstimation}>
          {t('NEW_ESTIMATION')}
        </Button>
      </div>
    </div>
  );
};
