'use client';

import React from 'react';
import { styled } from 'styled-components';
import { Flex } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { selectAllCategoryFeesTotal } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { UnforeseenRowWrapper } from '../../styled';

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
  color: #4b5675;
`;

const TotalSum = styled.div`
  font-weight: 600;
  font-size: 13px;
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 90px;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--white);
`;

export const CategoryFeesTotal: React.FC = () => {
  const { vendorTotal, clientTotal } = useAppSelector(selectAllCategoryFeesTotal);

  if (vendorTotal === 0 && clientTotal === 0) {
    return null;
  }

  return (
    <UnforeseenRowWrapper>
      <EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }} />
      <Label style={{ gridColumn: 'span 6' }}>
        <Flex align="center" justify="end">
          Category Fees
        </Flex>
        <TotalSum>{formatCurrency(vendorTotal)}</TotalSum>
      </Label>
      <div />
      <Flex
        justify="flex-end"
        style={{ gridColumn: 'span 5', paddingRight: '16px', backgroundColor: 'var(--white)', borderRadius: '6px' }}
      >
        <TotalSum>{formatCurrency(clientTotal)}</TotalSum>
      </Flex>
    </UnforeseenRowWrapper>
  );
};
