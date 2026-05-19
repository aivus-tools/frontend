'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectClientTotalSum } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

import commonStyles from '../components.module.css';
import styles from './SubtotalAllSections.module.css';

export const SubtotalAllSections = () => {
  const { formatted: totalClient } = useAppSelector(selectClientTotalSum);

  return (
    <div className={commonStyles.summaryRow}>
      <span className={styles.label}>{t('SUBTOTAL_FOR_ALL_SECTIONS')}</span>
      <span className={styles.value}>{totalClient}</span>
    </div>
  );
};
