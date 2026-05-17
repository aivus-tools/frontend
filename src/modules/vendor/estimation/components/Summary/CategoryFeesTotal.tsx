'use client';

import React from 'react';
import { Flex } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { selectAllCategoryFeesTotal } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';

import estimationStyles from '@/modules/vendor/estimation/estimation.module.css';
import styles from './CategoryFeesTotal.module.css';

export const CategoryFeesTotal = () => {
  const { vendorTotal, clientTotal } = useAppSelector(selectAllCategoryFeesTotal);

  if (vendorTotal === 0 && clientTotal === 0) {
    return null;
  }

  return (
    <div className={`${estimationStyles.summaryRowWrapper} ${estimationStyles.unforeseenRowWrapper}`}>
      <div className={styles.emptyBlockTotalSum} style={{ borderRadius: '6px 0 0 6px' }} />
      <div className={styles.label} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          Category Fees
        </Flex>
        <div className={styles.totalSum}>{formatCurrency(vendorTotal)}</div>
      </div>
      <div />
      <Flex
        justify='flex-end'
        style={{
          gridColumn: 'span 5',
          paddingRight: '16px',
          backgroundColor: 'var(--white)',
          borderRadius: '6px',
        }}
      >
        <div className={styles.totalSum}>{formatCurrency(clientTotal)}</div>
      </Flex>
    </div>
  );
};
