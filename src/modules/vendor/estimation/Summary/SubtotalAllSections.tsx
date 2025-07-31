'use client';

import { styled } from 'styled-components';
import SettingsIcon from '@/icons/settings-icon.svg';
import { Flex } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { selectTotalSum, selectClientTotalSum } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: left;
  padding: 16px 0;
  background-color: var(--bg-green);
  font-weight: 700;
  font-size: 14px;
  line-height: 17.07px;
  padding-right: 40px;
  gap: 8px;
`;
const TotalSum = styled.div`
  min-width: 90px;
  font-weight: 600;
  font-size: 16px;
  line-height: 19.5px;
  color: var(--green-darker);
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--bg-green);
`;

export const SubtotalAllSections = () => {
  const { formatted: total } = useAppSelector(selectTotalSum);
  const { formatted: totalClient } = useAppSelector(selectClientTotalSum);

  return (
    <>
      <EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%' }}>
          <SettingsIcon />
        </Flex>
      </EmptyBlockTotalSum>
      <Label style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('SUBTOTAL_FOR_ALL_SECTIONS')}
        </Flex>
        <TotalSum>{`$ ${total}`}</TotalSum>
      </Label>
      <div />
      <Flex
        justify='flex-end'
        style={{ gridColumn: 'span 5', paddingRight: '16px', backgroundColor: 'var(--bg-green)' }}
      >
        <TotalSum>{`$ ${totalClient}`}</TotalSum>
      </Flex>
    </>
  );
};
