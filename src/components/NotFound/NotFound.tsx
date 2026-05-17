'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';

import styles from './NotFound.module.css';

export const NotFound = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push(AppRoute.DASHBOARD);
  };

  return (
    <div className={styles.wrapper}>
      <Result
        status='404'
        title={t('PAGE_NOT_FOUND_TITLE')}
        subTitle={t('PAGE_NOT_FOUND_SUBTITLE')}
        extra={
          <Button type='primary' onClick={handleBack}>
            {t('BACK_TO_DASHBOARD')}
          </Button>
        }
      />
    </div>
  );
};
