'use client';
import { Flex } from 'antd';
import EyeCrossed from '@/icons/eye-crossed.svg';
import Eye from '@/icons/eye.svg';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectGrandTotal, selectShowCostPerVideo } from '@/store/slices/offer/selectors';
import { changeShowCostPerVideo } from '@/store/slices/offer/slice';
import { t } from '@/lib/i18n';

import styles from './CostPerVideo.module.css';

export const CostPerVideo = () => {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(selectShowCostPerVideo);
  const { totalValue, clientTotalValue } = useAppSelector(selectGrandTotal);
  const handleVisible = () => {
    dispatch(changeShowCostPerVideo(!isVisible));
  };

  const countOfVideos = 1;

  return (
    <>
      <div className={styles.emptyBlockTotalSum} style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%', cursor: 'pointer' }} onClick={handleVisible}>
          {isVisible ? <Eye /> : <EyeCrossed />}
        </Flex>
      </div>
      <div className={styles.label} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('COST_PER_VIDEO', String(countOfVideos))}
        </Flex>
        <Flex align='center'>
          <div className={styles.totalSum}>{formatCurrency(totalValue / countOfVideos)}</div>
        </Flex>
      </div>
      <div />
      <Flex
        justify='flex-end'
        align='center'
        style={{
          gridColumn: 'span 5',
          paddingRight: '16px',
          backgroundColor: 'var(--white)',
        }}
      >
        <div className={styles.totalSum}>{formatCurrency(clientTotalValue / countOfVideos)}</div>
      </Flex>
    </>
  );
};
