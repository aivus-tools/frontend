'use client';

import type { Category } from '@/types/estimation.interface';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { Flex } from 'antd';
import { RowLine } from '@/modules/vendor/estimation/componnets/RowLine';
import { ArrowButton } from '@/modules/vendor/estimation/componnets/Title/ArrowButton';
import { SectionTitle, SectionTitleSumHeader, SectionTitleText } from '@/modules/vendor/estimation/componnets/Title/styled';
import { formatCurrency } from '@/lib/utils';

interface Props {
  category: Category;
  itemKey: string;
  clientTotal: number | string;
}

export const Title = ({ category, itemKey, clientTotal }: Props) => {
  const { keys, switchKey } = useExpandedKeys();
  const isOpen = !!keys?.includes(itemKey);
  const handleClick = () => switchKey(itemKey);

  const displayTotal = typeof clientTotal === 'number' ? formatCurrency(clientTotal) : clientTotal;

  return (
    <>
      {/* Matches Estimation Title layout: 13 columns total */}
      <SectionTitle style={{ gridColumn: isOpen ? 'span 7' : 'span 5' }} $isOpen={isOpen}>
        <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
          <ArrowButton isOpen={isOpen} />
          <SectionTitleText>{category.name}</SectionTitleText>
        </Flex>
      </SectionTitle>
      {!isOpen && (
        <>
          <SectionTitleSumHeader>{displayTotal}</SectionTitleSumHeader>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
        </>
      )}
      <div />
      {isOpen ? (
        <SectionTitle style={{ gridColumn: 'span 5', borderRadius: '0 6px 0 0' }} />
      ) : (
        <>
          <SectionTitleSumHeader style={{ gridColumn: 'span 4', justifyContent: 'flex-end' }}>
            {displayTotal}
          </SectionTitleSumHeader>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
        </>
      )}
      {isOpen && <RowLine />}
    </>
  );
};

