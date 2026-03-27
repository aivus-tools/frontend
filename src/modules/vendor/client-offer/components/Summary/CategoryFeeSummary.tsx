'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAllCategoryFeesTotal } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { AgencyServiceRow } from '../styled';
import { styled } from 'styled-components';
import { t } from '@/lib/i18n';

const FeeLabel = styled.span`
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #4b5675;
`;

const FeeValue = styled.span`
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  color: #4b5675;
`;

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 110px;
  padding-right: 2px;
`;

export const CategoryFeeSummary: React.FC = () => {
  const { clientTotal } = useAppSelector(selectAllCategoryFeesTotal);

  if (clientTotal === 0) {
    return null;
  }

  return (
    <AgencyServiceRow>
      <FeeLabel>{t('FEES')}</FeeLabel>
      <ValueWrapper>
        <FeeValue>{formatCurrency(clientTotal)}</FeeValue>
      </ValueWrapper>
    </AgencyServiceRow>
  );
};
