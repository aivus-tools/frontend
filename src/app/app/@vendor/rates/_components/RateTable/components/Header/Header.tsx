'use client';

import { t } from '@/lib/i18n';
import { THeadItem } from '@/components/THeadItem/THeadItem';

import styles from './Header.module.css';

export function Header() {
  return (
    <div className={styles.header}>
      <THeadItem text={t('ITEMS')} className={styles.items} />
      <THeadItem text={t('PRICE')} className={styles.price} />
      <THeadItem text={t('UNITS')} className={styles.units} />
    </div>
  );
}
