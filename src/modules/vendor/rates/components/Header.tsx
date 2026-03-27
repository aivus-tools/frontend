'use client';

import { t } from '@/lib/i18n';
import styles from '../RateTable.module.css';

export function RateHeader() {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerItems}>{t('ITEMS')}</div>
      <div className={styles.headerPrice}>{t('PRICE')}</div>
      {/* <div />
      <div className={styles.headerUnits}>{t('UNITS')}</div> */}
      <div />
    </div>
  );
}
