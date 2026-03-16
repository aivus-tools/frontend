'use client';

import React, { useState, useCallback } from 'react';
import { Flex, Switch, Input, InputNumber } from 'antd';
import { styled } from 'styled-components';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCategoryExternalMarkup, selectCategoryFees, selectIsExternal , FeeRow } from '@/store/slices/offer/selectors';
import { setCategoryExternalMarkup } from '@/store/slices/offer/slice';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/store/store';
import { percentFormat, percentParser } from '../../helpers/format';

const MarkupLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--white);
  padding: 4px 0;
  padding-right: 40px;
  gap: 8px;
  font-weight: 500;
  font-size: 12px;
  color: #99a1b7;
`;

const MarkupValue = styled.div`
  font-weight: 500;
  font-size: 12px;
  color: #99a1b7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 90px;
`;

const EmptyCell = styled.div`
  background-color: var(--white);
`;

const SwitchCell = styled.div`
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EditableName = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    text-decoration-style: dashed;
  }
`;

interface CategoryExternalMarkupProps {
  categoryId: string;
}

export const CategoryExternalMarkup: React.FC<CategoryExternalMarkupProps> = (props) => {
  const dispatch = useAppDispatch();
  const markup = useAppSelector(
    useCallback((state: RootState) => selectCategoryExternalMarkup(state, props.categoryId), [props.categoryId])
  );
  const fees = useAppSelector(
    useCallback((state: RootState) => selectCategoryFees(state, props.categoryId), [props.categoryId])
  );
  const isExternal = useAppSelector(selectIsExternal);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  if (!markup || isExternal) {
    return null;
  }

  const extFee = fees.find((x: FeeRow) => x.key.startsWith('EXT_MARKUP_'));
  const clientAmount = extFee?.clientAmount ?? 0;

  const handleToggle = () => {
    dispatch(setCategoryExternalMarkup({ categoryId: props.categoryId, enabled: !markup.enabled }));
  };

  const handlePercentChange = (value: number | null) => {
    if (value !== null) {
      dispatch(setCategoryExternalMarkup({ categoryId: props.categoryId, percent: value }));
    }
  };

  const handleStartEditName = () => {
    setNameValue(markup.name);
    setEditingName(true);
  };

  const handleFinishEditName = () => {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== markup.name) {
      dispatch(setCategoryExternalMarkup({ categoryId: props.categoryId, name: trimmed }));
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEditName();
    } else if (e.key === 'Escape') {
      setEditingName(false);
    }
  };

  return (
    <>
      <SwitchCell>
        <Switch size='small' checked={markup.enabled} onClick={handleToggle} />
      </SwitchCell>
      <MarkupLabel style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {editingName ? (
            <Input
              size='small'
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={handleFinishEditName}
              onKeyDown={handleNameKeyDown}
              autoFocus
              style={{ fontSize: 12, width: 160 }}
            />
          ) : (
            <EditableName onClick={handleStartEditName}>
              {markup.name || 'Markup'}
            </EditableName>
          )}
        </Flex>
        <Flex align='center'>
          <InputNumber
            size='small'
            controls={false}
            value={markup.percent}
            onChange={handlePercentChange}
            formatter={percentFormat}
            parser={percentParser}
            disabled={!markup.enabled}
            style={{ width: 70, fontSize: 12 }}
          />
          <MarkupValue>-</MarkupValue>
        </Flex>
      </MarkupLabel>
      <div />
      <Flex
        justify='flex-end'
        style={{ gridColumn: 'span 4', paddingRight: '16px', backgroundColor: 'var(--white)' }}
      >
        <MarkupValue>
          {markup.enabled ? formatCurrency(clientAmount) : '-'}
        </MarkupValue>
      </Flex>
      <EmptyCell style={{ gridColumn: 'span 1' }} />
    </>
  );
};
