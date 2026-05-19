'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAllCategoryFeesTotal } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';

import commonStyles from '../components.module.css';
import styles from './CategoryFeeSummary.module.css';

export const CategoryFeeSummary = () => {
  const { clientTotal } = useAppSelector(selectAllCategoryFeesTotal);

  if (clientTotal === 0) {
    return null;
  }

  return (
    <div className={commonStyles.agencyServiceRow}>
      <span className={styles.feeLabel}>{t('FEES')}</span>
      <div className={styles.valueWrapper}>
        <span className={styles.feeValue}>{formatCurrency(clientTotal)}</span>
      </div>
    </div>
  );
};
