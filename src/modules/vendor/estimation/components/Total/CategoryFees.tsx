'use client';

import React, { useState, useCallback } from 'react';
import { Flex, Input } from 'antd';
import { styled } from 'styled-components';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCategoryFees, selectIsExternal } from '@/store/slices/offer/selectors';
import { setCustomFeeName } from '@/store/slices/offer/slice';
import { FeeRow } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/store/store';

const FeeLabel = styled.div`
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

const FeeValue = styled.div`
  font-weight: 500;
  font-size: 12px;
  color: #99a1b7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 90px;
`;

const PercentBadge = styled.span`
  font-size: 11px;
  color: #c4cada;
  margin-right: 12px;
`;

const EmptyCell = styled.div`
  background-color: var(--white);
`;

const EditableName = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    text-decoration-style: dashed;
  }
`;

interface CategoryFeesProps {
  categoryId: string;
}

export const CategoryFees: React.FC<CategoryFeesProps> = (props) => {
  const fees = useAppSelector(
    useCallback((state: RootState) => selectCategoryFees(state, props.categoryId), [props.categoryId])
  );
  const isExternal = useAppSelector(selectIsExternal);

  const standardFees = fees.filter((x: FeeRow) => !x.key.startsWith('EXT_MARKUP_'));

  if (standardFees.length === 0) {
    return null;
  }

  return (
    <>
      {standardFees.map((fee: FeeRow) => (
        <FeeRowItem key={fee.key} fee={fee} readOnly={isExternal} />
      ))}
    </>
  );
};

interface FeeRowItemProps {
  fee: FeeRow;
  readOnly: boolean;
}

const FeeRowItem: React.FC<FeeRowItemProps> = (props) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(props.fee.name);

  const handleStartEdit = () => {
    if (props.readOnly) {
      return;
    }
    setEditValue(props.fee.name);
    setEditing(true);
  };

  const handleFinishEdit = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== props.fee.name) {
      dispatch(setCustomFeeName({ feeKey: props.fee.key, name: trimmed }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  return (
    <>
      <EmptyCell />
      <FeeLabel style={{ gridColumn: 'span 6' }}>
        <Flex align="center" justify="end">
          {editing ? (
            <Input
              size="small"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ fontSize: 12, width: 160 }}
            />
          ) : (
            <EditableName onClick={handleStartEdit}>
              {props.fee.name}
            </EditableName>
          )}
        </Flex>
        <Flex align="center">
          <PercentBadge>{props.fee.percent}%</PercentBadge>
          <FeeValue>{formatCurrency(props.fee.vendorAmount)}</FeeValue>
        </Flex>
      </FeeLabel>
      <div />
      <Flex
        justify="flex-end"
        style={{ gridColumn: 'span 4', paddingRight: '16px', backgroundColor: 'var(--white)' }}
      >
        <FeeValue>{formatCurrency(props.fee.clientAmount)}</FeeValue>
      </Flex>
      <EmptyCell style={{ gridColumn: 'span 1' }} />
    </>
  );
};
