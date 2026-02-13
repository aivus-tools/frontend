'use client';

import React from 'react';
import { styled } from 'styled-components';
import { Typography } from 'antd';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 0;
  width: 100%;
`;

const Label = styled(Typography.Text)`
  font-weight: 700;
  font-size: 14px;
  color: var(--main);
  margin-right: 12px;
`;

const Value = styled(Typography.Text)`
  font-weight: 700;
  font-size: 15px;
  color: var(--main);
  min-width: 100px;
  text-align: right;
`;

interface Props {
  name: string;
  total: number;
}

export const SubTotalRow = ({ name, total }: Props) => {
  return (
    <Wrapper>
      <Label>{t('SUBTOTAL_OF_LOCATIONS', name.toLowerCase())}</Label>
      <Value style={{ color: 'var(--blue)' }}>{formatCurrency(total)}</Value>
    </Wrapper>
  );
};
