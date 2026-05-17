'use client';

import SettingsIcon from '@/icons/settings-icon.svg';
import { Flex } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { t } from '@/lib/i18n';
import { selectGrandTotal } from '@/store/slices/offer/selectors';

import estimationStyles from '@/modules/vendor/estimation/estimation.module.css';
import styles from './GrandTotal.module.css';

export const GrandTotal = () => {
  const { total, clientTotal } = useAppSelector(selectGrandTotal);
  return (
    <div className={`${estimationStyles.summaryRowWrapper} ${estimationStyles.grandTotalRowWrapper}`}>
      <div className={styles.emptyBlockTotalSum} style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%' }}>
          <SettingsIcon />
        </Flex>
      </div>
      <div className={styles.label} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('GRAND_TOTAL')}
        </Flex>
        <div className={styles.totalSum}>{total}</div>
      </div>
      <div />
      <Flex
        justify='flex-end'
        style={{
          gridColumn: 'span 5',
          paddingRight: '16px',
          backgroundColor: 'var(--bg-blue-important)',
          borderRadius: '6px',
        }}
      >
        <div className={styles.totalSum}>{clientTotal}</div>
      </Flex>
    </div>
  );
};
