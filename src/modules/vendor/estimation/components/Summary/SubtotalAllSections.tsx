'use client';

import SettingsIcon from '@/icons/settings-icon.svg';
import { Flex } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { selectTotalSum, selectClientTotalSum } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

import estimationStyles from '@/modules/vendor/estimation/estimation.module.css';
import styles from './SubtotalAllSections.module.css';

export const SubtotalAllSections = () => {
  const { formatted: total } = useAppSelector(selectTotalSum);
  const { formatted: totalClient } = useAppSelector(selectClientTotalSum);

  return (
    <div className={estimationStyles.summaryRowWrapper}>
      <div className={styles.emptyBlockTotalSum} style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%' }}>
          <SettingsIcon />
        </Flex>
      </div>
      <div className={styles.label} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('SUBTOTAL_FOR_ALL_SECTIONS')}
        </Flex>
        <div className={styles.totalSum}>{total}</div>
      </div>
      <div />
      <Flex
        justify='flex-end'
        style={{
          gridColumn: 'span 5',
          paddingRight: '16px',
          backgroundColor: 'var(--bg-green)',
          borderRadius: '6px',
        }}
      >
        <div className={styles.totalSum}>{totalClient}</div>
      </Flex>
    </div>
  );
};
