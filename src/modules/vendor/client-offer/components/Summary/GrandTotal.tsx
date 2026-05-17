'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

import commonStyles from '../components.module.css';
import styles from './GrandTotal.module.css';

export const GrandTotal = () => {
  const { clientTotal } = useAppSelector(selectGrandTotal);

  return (
    <div className={commonStyles.grandTotalRow}>
      <span className={styles.label}>{t('GRAND_TOTAL')}</span>
      <span className={styles.value}>{clientTotal}</span>
    </div>
  );
};
