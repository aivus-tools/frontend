'use client';

import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal } from '@/store/slices/offer/selectors';
import { styled } from 'styled-components';
import { t } from '@/lib/i18n';
import { Flex } from 'antd';

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: var(--bg-blue-important);
  padding: 16px 0;
  padding-right: 40px;
  gap: 8px;

  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
`;

const TotalSum = styled.div`
  min-width: 90px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  font-weight: 700;
  font-size: 18px;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--bg-blue-important);
`;

export function GrandTotal() {
  const { clientTotal } = useAppSelector(selectGrandTotal);
  
  return (
    <>
      {/* Matches Estimation GrandTotal layout: 13 columns total */}
      <EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }} />
      <Label style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('GRAND_TOTAL')}
        </Flex>
        <TotalSum>{`$ ${clientTotal}`}</TotalSum>
      </Label>
      <div />
      <Flex
        justify='flex-end'
        style={{ gridColumn: 'span 5', paddingRight: '16px', backgroundColor: 'var(--bg-blue-important)' }}
      >
        <TotalSum>{`$ ${clientTotal}`}</TotalSum>
      </Flex>
    </>
  );
}

