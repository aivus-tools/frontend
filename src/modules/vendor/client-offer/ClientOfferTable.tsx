'use client';

import React, { useMemo } from 'react';
import { OfferData } from '@/types/estimation.interface';
import { FileTextOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectOfferDetails } from '@/store/slices/offer/selectors';
import { KeysProvider } from '@/modules/vendor/estimation/context/expanded';
import { Category } from '@/modules/vendor/client-offer/components/Category';
import { Summary } from '@/modules/vendor/client-offer/components/Summary/Summary';
import { Empty } from 'antd';
import { KEY_SEPARATOR } from '../estimation/constants';

import styles from './components/components.module.css';

interface ClientOfferTableProps {
  offers?: OfferData[];
}

export const ClientOfferTable = (_props: ClientOfferTableProps) => {
  const offerDetails = useAppSelector(selectOfferDetails);
  const categories = offerDetails?.categories ?? [];
  const subCategories = offerDetails?.subCategories ?? [];

  const topCategories = useMemo(() => categories.filter((cat) => !cat.parentCategoryId), [categories]);

  const initialKeys = useMemo(() => {
    const catKeys = categories.map((cat) => cat.id.toString());
    const subCatKeys = subCategories
      .filter((cat) => cat.parentCategoryId)
      .map((cat) => `${cat.parentCategoryId}${KEY_SEPARATOR}${cat.id}`);
    return [...catKeys, ...subCatKeys];
  }, [categories, subCategories]);

  if (categories.length === 0) {
    return (
      <div className={styles.content} style={{ padding: '60px', alignItems: 'center' }}>
        <Empty description={t('EMPTY')} />
      </div>
    );
  }

  return (
    <KeysProvider initialKeys={initialKeys}>
      <div className={styles.wrapper}>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>
              <FileTextOutlined style={{ color: 'var(--gray-light)', fontSize: 14 }} />
            </div>
            <div className={`${styles.headerCell} ${styles.headerCellLeft}`}>{t('ITEM')}</div>
            <div className={`${styles.headerCell} ${styles.headerCellRight}`}>{t('PRICE')}</div>
            <div className={`${styles.headerCell} ${styles.headerCellRight}`}>{t('UNITS')}</div>
            <div className={styles.headerCell}>{t('QUANTITY')}</div>
            <div className={styles.headerCell}>{t('COST')}</div>
            <div className={styles.headerCell} />
          </div>

          {topCategories.map((category) => (
            <Category key={category.id} category={category} />
          ))}

          <Summary />
        </div>
      </div>
    </KeysProvider>
  );
};
