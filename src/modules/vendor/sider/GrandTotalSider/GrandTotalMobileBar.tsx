'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal } from '@/store/slices/offer/selectors';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { formatPrice } from '@/helpers/helper';
import { t } from '@/lib/i18n';

import styles from './GrandTotalMobileBar.module.css';

export const GRAND_TOTAL_MOBILE_BAR_HEIGHT = 60;

export const GrandTotalMobileBar = () => {
  const { isMobile, ready } = useBreakpoint();
  const { dismissed } = useBetaFooter();
  const betaHeight = useBetaFooterHeight();
  const { totalValue, clientTotalValue } = useAppSelector(selectGrandTotal);

  if (!ready || !isMobile) {
    return null;
  }
  if (totalValue === 0 && clientTotalValue === 0) {
    return null;
  }

  const diff = clientTotalValue - totalValue;
  const bottomOffset = dismissed ? 0 : betaHeight;

  return (
    <div
      className={styles.bar}
      style={{ '--mobile-bar-bottom': bottomOffset + 'px' } as React.CSSProperties}
      role='status'
      aria-label={t('TOTAL_CLIENTS_COST')}
    >
      <div className={styles.cell}>
        <div className={styles.label}>{t('TOTAL_CLIENTS_COST')}</div>
        <div className={styles.value}>${formatPrice(clientTotalValue)}</div>
      </div>
      <div className={styles.cell}>
        <div className={styles.label}>{t('EXPENSES')}</div>
        <div className={styles.value}>${formatPrice(totalValue)}</div>
      </div>
      <div className={styles.cell}>
        <div className={styles.label}>{t('REVENUE_AND_MARKUP')}</div>
        <div className={styles.value}>${formatPrice(diff)}</div>
      </div>
    </div>
  );
};
