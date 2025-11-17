'use client';

import { Flex } from 'antd';
import { styled } from 'styled-components';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';

const Label = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 17.07px;
  letter-spacing: 0;
  text-align: right;
  padding: 16px 0;
  text-transform: uppercase;
`;

const TotalSum = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19.5px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--blue);
  padding: 16px 0;
  min-width: 90px;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--bg-blue-important);
  border-radius: 0 0 6px 6px;
`;

interface Props {
  text: string;
  clientTotal: number | string;
}

export const Total = ({ text, clientTotal }: Props) => {
  const displayTotal = typeof clientTotal === 'number' ? formatCurrency(clientTotal) : clientTotal;
  
  return (
    <>
      {/* Matches Estimation Total layout: 13 columns total */}
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--bg-blue-important)', borderRadius: '0 0 0 6px' }}
      />
      <Flex
        align='center'
        justify='space-between'
        style={{ 
          gridColumn: 'span 6', 
          backgroundColor: 'var(--bg-blue-important)',
          paddingRight: '40px',
          gap: '8px'
        }}
      >
        <div />
        <Flex>
          <Label>
            {text} {t('TOTAL')}:
          </Label>
          <TotalSum style={{ marginLeft: '8px' }}>{displayTotal}</TotalSum>
        </Flex>
      </Flex>
      <div />
      <Flex style={{ gridColumn: 'span 4', backgroundColor: 'var(--bg-blue-important)' }} justify='flex-end'>
        <TotalSum>{displayTotal}</TotalSum>
      </Flex>
      <EmptyBlockTotalSum style={{ gridColumn: 'span 1' }} />
    </>
  );
};

