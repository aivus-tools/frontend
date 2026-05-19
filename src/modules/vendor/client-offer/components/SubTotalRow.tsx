'use client';

import React from 'react';
import { Typography } from 'antd';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';

import styles from './SubTotalRow.module.css';

interface SubTotalRowProps {
  name: string;
  total: number;
}

export const SubTotalRow = (props: SubTotalRowProps) => {
  return (
    <div className={styles.wrapper}>
      <Typography.Text className={styles.label}>{t('SUBTOTAL_OF_LOCATIONS', props.name.toLowerCase())}</Typography.Text>
      <Typography.Text className={styles.value}>{formatCurrency(props.total)}</Typography.Text>
    </div>
  );
};
