'use client';

import React, { useState, useCallback } from 'react';
import { Flex, Switch, Input, InputNumber } from 'antd';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCategoryExternalMarkup,
  selectCategoryFees,
  selectIsExternal,
  FeeRow,
} from '@/store/slices/offer/selectors';
import { setCategoryExternalMarkup } from '@/store/slices/offer/slice';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/store/store';
import { percentFormat, percentParser } from '@/modules/vendor/estimation/helpers/format';

import styles from './CategoryExternalMarkup.module.css';

interface CategoryExternalMarkupProps {
  categoryId: string;
}

export const CategoryExternalMarkup = (props: CategoryExternalMarkupProps) => {
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

  const handleNameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleFinishEditName();
    } else if (event.key === 'Escape') {
      setEditingName(false);
    }
  };

  return (
    <>
      <div className={styles.emptyCell} />
      <div className={styles.markupLabel} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end' gap={8}>
          <Switch size='small' checked={markup.enabled} onClick={handleToggle} />
          {editingName ? (
            <Input
              size='small'
              value={nameValue}
              onChange={(event) => setNameValue(event.target.value)}
              onBlur={handleFinishEditName}
              onKeyDown={handleNameKeyDown}
              autoFocus
              style={{ fontSize: 12, width: 160 }}
            />
          ) : (
            <span className={styles.editableName} onClick={handleStartEditName}>
              {markup.name || 'Markup'}
            </span>
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
          <div className={styles.markupValue}>{markup.enabled ? formatCurrency(extFee?.vendorAmount ?? 0) : '-'}</div>
        </Flex>
      </div>
      <div />
      <Flex justify='flex-end' style={{ gridColumn: 'span 4', backgroundColor: 'var(--white)' }}>
        <div className={styles.markupValue}>{markup.enabled ? formatCurrency(clientAmount) : '-'}</div>
      </Flex>
      <div className={styles.emptyCell} style={{ gridColumn: 'span 1' }} />
    </>
  );
};
