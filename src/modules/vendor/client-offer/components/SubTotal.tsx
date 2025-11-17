'use client';

import { Flex } from 'antd';
import { styled } from 'styled-components';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';

const LabelSubTotal = styled.div`
  font-weight: 600;
  font-size: 13px;
  line-height: 15.85px;
  text-align: right;
  padding: 12px 0;
  background-color: var(--bg-blue-subtotal);
`;

const SubTotalSum = styled.div`
  width: 100%;
  padding: 12px 0;
  font-weight: 700;
  font-size: 14px;
  line-height: 17.07px;
  border-radius: 0 0 6px 6px;
  text-align: right;
  color: var(--blue);
  background-color: var(--bg-blue-subtotal);
  justify-content: flex-end;
`;

const EmptyBlockSubTotalSum = styled.div`
  background-color: var(--bg-blue-subtotal);
  border-radius: 0 0 6px 6px;
`;

interface Props {
  clientTotal: number | string;
  subCategoryId?: string;
}

export const SubTotal = ({ clientTotal }: Props) => {
  const displayTotal = typeof clientTotal === 'number' ? formatCurrency(clientTotal) : clientTotal;
  
  return (
    <>
      {/* Matches Estimation SubTotal layout: 13 columns total */}
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--bg-blue-subtotal)', borderRadius: '0 0 0 6px' }}
      >
        <div />
      </Flex>
      <div style={{ backgroundColor: 'var(--bg-blue-subtotal)' }} />
      <LabelSubTotal style={{ gridColumn: 'span 3' }}>{t('SUBTOTAL_OF_LOCATIONS')}</LabelSubTotal>
      <SubTotalSum>{displayTotal}</SubTotalSum>
      <EmptyBlockSubTotalSum style={{ borderRadius: '0 0 6px 0' }} />
      <div />
      <Flex style={{ gridColumn: 'span 4', backgroundColor: 'var(--bg-blue-subtotal)' }}>
        <SubTotalSum>{displayTotal}</SubTotalSum>
      </Flex>
      <EmptyBlockSubTotalSum style={{ gridColumn: 'span 1' }} />
    </>
  );
};

