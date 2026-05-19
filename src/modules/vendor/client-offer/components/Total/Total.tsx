'use client';

import React from 'react';
import { t } from '@/lib/i18n';

import commonStyles from '../components.module.css';
import styles from './Total.module.css';

interface TotalProps {
  text: string;
  value: string;
}

export const Total = (props: TotalProps) => {
  return (
    <div className={commonStyles.categoryTotalRow}>
      <span className={styles.totalLabel}>
        {props.text} {t('TOTAL')}:
      </span>
      <span className={styles.totalValue}>{props.value}</span>
    </div>
  );
};
