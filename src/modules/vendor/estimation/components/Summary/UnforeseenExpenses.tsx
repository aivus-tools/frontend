'use client';

import { styled } from 'styled-components';
import { Flex } from 'antd';
import EyeCrossed from '@/icons/eye-crossed.svg';
import Eye from '@/icons/eye.svg';
import { percentFormat, percentParser } from '../../helpers/format';
import { InputNumberRight, UnforeseenRowWrapper } from '../../styled';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeUnforeseenExpenses } from '@/store/slices/offer/slice';
import { selectUnforeseenExpenses } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: left;
  padding: 4px 0;
  background-color: var(--white);
  padding-right: 40px;
  gap: 8px;
  font-weight: 500;
  font-size: 13px;
`;
const TotalSum = styled.div`
  font-weight: 600;
  font-size: 13px;
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--white);
`;

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
    <UnforeseenRowWrapper>
      <EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%', cursor: 'pointer' }} onClick={handleVisible}>
          {isVisible ? <Eye /> : <EyeCrossed />}
        </Flex>
      </EmptyBlockTotalSum>
      <Label style={{ gridColumn: 'span 6' }}>
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
          <TotalSum style={{ minWidth: '90px' }}>{total}</TotalSum>
        </Flex>
      </Label>
    </UnforeseenRowWrapper>
  );
};
