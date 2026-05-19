'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Flex, Input, InputNumber } from 'antd';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCategoryFees, selectIsExternal, selectOfferMetaData, FeeRow } from '@/store/slices/offer/selectors';
import { setCustomFeeName, setMetaData } from '@/store/slices/offer/slice';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/store/store';
import { percentFormat, percentParser } from '@/modules/vendor/estimation/helpers/format';
import { useUpdateOfferMutation } from '@/services/client/offersApi';
import { Offer } from '@/types/offer.interface';
import debounce from 'lodash.debounce';
import logger from '@/lib/logger';

import styles from './CategoryFees.module.css';

interface CategoryFeesProps {
  categoryId: string;
}

export const CategoryFees = (props: CategoryFeesProps) => {
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

const FeeRowItem = (props: FeeRowItemProps) => {
  const dispatch = useAppDispatch();
  const metaData = useAppSelector(selectOfferMetaData);
  const [updateOffer] = useUpdateOfferMutation();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(props.fee.name);

  const metaDataRef = useRef(metaData);
  metaDataRef.current = metaData;

  const saveToServer = useCallback(
    (field: string, value: string) => {
      const current = metaDataRef.current;
      if (!current) {
        return;
      }
      updateOffer({ id: current.id, [field]: value } as Partial<Offer> & Pick<Offer, 'id'>)
        .unwrap()
        .then((x) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { details: _details, ...meta } = x;
          dispatch(setMetaData(meta));
        })
        .catch((x) => {
          logger.error('Failed to save fee percent', x);
        });
    },
    [updateOffer, dispatch]
  );

  const debouncedSave = useMemo(() => {
    return debounce(saveToServer, 500);
  }, [saveToServer]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handlePercentChange = useCallback(
    (value: number | null) => {
      const current = metaDataRef.current;
      if (!props.fee.metaField || !current) {
        return;
      }
      const stringValue = String(value ?? 0);
      dispatch(setMetaData({ ...current, [props.fee.metaField]: stringValue }));
      debouncedSave(props.fee.metaField, stringValue);
    },
    [props.fee.metaField, dispatch, debouncedSave]
  );

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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleFinishEdit();
    } else if (event.key === 'Escape') {
      setEditing(false);
    }
  };

  return (
    <>
      <div className={styles.emptyCell} />
      <div className={styles.feeLabel} style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {editing ? (
            <Input
              size='small'
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ fontSize: 12, width: 160 }}
            />
          ) : (
            <span className={styles.editableName} onClick={handleStartEdit}>
              {props.fee.name}
            </span>
          )}
        </Flex>
        <Flex align='center'>
          {props.fee.metaField && !props.readOnly ? (
            <InputNumber
              size='small'
              value={props.fee.percent}
              onChange={handlePercentChange}
              controls={false}
              formatter={percentFormat}
              parser={percentParser}
              style={{ width: 70, fontSize: 12 }}
            />
          ) : (
            <span style={{ fontSize: 12, color: 'var(--bg-gray-light)', marginRight: 12 }}>{props.fee.percent} %</span>
          )}
          <div className={styles.feeValue}>{formatCurrency(props.fee.vendorAmount)}</div>
        </Flex>
      </div>
      <div />
      <Flex justify='flex-end' style={{ gridColumn: 'span 4', backgroundColor: 'var(--white)' }}>
        <div className={styles.feeValue}>{formatCurrency(props.fee.clientAmount)}</div>
      </Flex>
      <div className={styles.emptyCell} style={{ gridColumn: 'span 1' }} />
    </>
  );
};
