'use client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { VendorTabs } from './vendor-tabs';
import { NEW_BRIEF_SLUG } from '@/constants/constants';

export const VendorNavbar = () => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(`/app/dashboard/${NEW_BRIEF_SLUG}/details`);
  }, [router]);

  const handleNewEstimation = () => {
    router.push(`/app/dashboard/${NEW_BRIEF_SLUG}/details`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <VendorTabs />
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button type='primary' onClick={handleNewEstimation}>
          New Estimation
        </Button>
      </div>
    </div>
  );
};
