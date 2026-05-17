'use client';

import { Flex } from 'antd';
import EyeCrossed from '@/icons/eye-crossed.svg';
import Eye from '@/icons/eye.svg';
import { percentFormat, percentParser } from '@/modules/vendor/estimation/helpers/format';
import { InputNumberRight } from '../InputNumberRight';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeUnforeseenExpenses } from '@/store/slices/offer/slice';
import { selectUnforeseenExpenses } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

import estimationStyles from '@/modules/vendor/estimation/estimation.module.css';
import styles from './UnforeseenExpenses.module.css';

export const UnforeseenExpenses = () => {
  const dispatch = useAppDispatch();
  const { isVisible, percent, total } = useAppSelector(selectUnforeseenExpenses);
  const handleVisible = () => {
    dispatch(changeUnforeseenExpenses({ isVisible: !isVisible }));
  };
  const handleChange = (percent: number | null) => {
    if (percent !== null) {
      dispatch(changeUnforeseenExpenses({ percent }));
    }
  };

  return (
    <div className={`${estimationStyles.summaryRowWrapper} ${estimationStyles.unforeseenRowWrapper}`}>
      <div className={styles.emptyBlockTotalSum} style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%', cursor: 'pointer' }} onClick={handleVisible}>
          {isVisible ? <Eye /> : <EyeCrossed />}
        </Flex>
      </div>
      <div className={styles.label} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('UNFORESEEN_EXPENSES')}
        </Flex>
        <Flex align='center'>
          <InputNumberRight
            onChange={handleChange}
            controls={false}
            value={percent}
            formatter={percentFormat}
            parser={percentParser}
          />
          <div className={styles.totalSum} style={{ minWidth: '90px' }}>
            {isVisible ? total : '–'}
          </div>
        </Flex>
      </div>
    </div>
  );
};
