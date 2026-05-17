'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal, selectShowCostPerVideo } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';

import commonStyles from '../components.module.css';
import styles from './CostPerVideo.module.css';

export const CostPerVideo = () => {
  const isVisible = useAppSelector(selectShowCostPerVideo);
  const { clientTotalValue } = useAppSelector(selectGrandTotal);

  if (!isVisible) {
    return null;
  }

  const countOfVideos = 1;
  const costPerVideo = clientTotalValue / countOfVideos;

  return (
    <div className={commonStyles.costPerVideoRow}>
      <span className={styles.label}>{t('COST_PER_VIDEO', String(countOfVideos))}</span>
      <span className={styles.value}>{formatCurrency(costPerVideo)}</span>
    </div>
  );
};
