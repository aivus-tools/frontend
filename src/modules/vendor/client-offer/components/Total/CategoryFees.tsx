'use client';

import React, { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectCategoryFees, FeeRow } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/store/store';

import styles from './CategoryFees.module.css';

interface CategoryFeesProps {
  categoryId: string;
}

export const CategoryFees = (props: CategoryFeesProps) => {
  const fees = useAppSelector(
    useCallback((state: RootState) => selectCategoryFees(state, props.categoryId), [props.categoryId])
  );

  if (fees.length === 0) {
    return null;
  }

  return (
    <>
      {fees.map((fee: FeeRow) => (
        <div key={fee.key} className={styles.feeRowWrapper}>
          <span className={styles.feeLabel}>{fee.name}</span>
          <div className={styles.rightSection}>
            <span className={styles.percentText}>{fee.percent}%</span>
            <span className={styles.feeValue}>{formatCurrency(fee.clientAmount)}</span>
          </div>
        </div>
      ))}
    </>
  );
};
