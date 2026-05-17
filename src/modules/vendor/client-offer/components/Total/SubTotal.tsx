'use client';

import React from 'react';
import { Flex } from 'antd';
import { t } from '@/lib/i18n';

import commonStyles from '../components.module.css';
import styles from './SubTotal.module.css';

interface SubTotalProps {
  name: string;
  value: string;
  subCategoryId?: string;
}

export const SubTotal = (props: SubTotalProps) => {
  return (
    <div className={commonStyles.subTotalRow}>
      <div />
      <Flex style={{ gridColumn: 'span 6', paddingRight: 40 }} justify='flex-end' align='center' gap={20}>
        <div className={`${commonStyles.label} ${styles.label}`}>{t('SUBTOTAL_OF_LOCATIONS', props.name)}</div>
        <div className={`${commonStyles.totalSum} ${styles.totalSum}`}>{props.value}</div>
      </Flex>
    </div>
  );
};
