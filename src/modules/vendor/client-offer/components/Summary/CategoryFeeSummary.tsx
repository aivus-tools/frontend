'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAllCategoryFeesTotal, FeeRow } from '@/store/slices/offer/selectors';
import { selectRootCategories, selectCategoryFees } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { AgencyServiceRow } from '../styled';
import { styled } from 'styled-components';
import { useCallback } from 'react';
import { RootState } from '@/store/store';

const FeeLabel = styled.span`
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #4b5675;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const PercentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
`;

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 110px;
  padding-right: 2px;
`;

const PercentValue = styled.span`
  font-weight: 500;
  font-size: 13px;
  color: #99a1b7;
`;

const PercentSign = styled.span`
  font-weight: 500;
  font-size: 10px;
  color: #99a1b7;
  margin-left: 3px;
  margin-top: 2px;
`;

const FeeValue = styled.span`
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  color: #4b5675;
`;

interface CategoryFeeRowProps {
  categoryId: string;
}

const CategoryFeeRows: React.FC<CategoryFeeRowProps> = props => {
  const fees = useAppSelector(
    useCallback((state: RootState) => selectCategoryFees(state, props.categoryId), [props.categoryId])
  );

  if (fees.length === 0) {
    return null;
  }

  return (
    <>
      {fees.map((fee: FeeRow) => (
        <AgencyServiceRow key={fee.key}>
          <FeeLabel>{fee.name}</FeeLabel>
          <RightSection>
            <PercentWrapper>
              <PercentValue>{fee.percent}</PercentValue>
              <PercentSign>%</PercentSign>
            </PercentWrapper>
            <ValueWrapper>
              <FeeValue>{formatCurrency(fee.clientAmount)}</FeeValue>
            </ValueWrapper>
          </RightSection>
        </AgencyServiceRow>
      ))}
    </>
  );
};

export const CategoryFeeSummary: React.FC = () => {
  const { clientTotal } = useAppSelector(selectAllCategoryFeesTotal);
  const rootCategories = useAppSelector(selectRootCategories);

  if (clientTotal === 0) {
    return null;
  }

  return (
    <>
      {rootCategories.map(x => (
        <CategoryFeeRows key={x.id} categoryId={x.id} />
      ))}
    </>
  );
};
