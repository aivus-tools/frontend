'use client';

import React, { useState } from 'react';
import { Typography, Flex } from 'antd';
import { formatCurrency } from '@/lib/utils';
import { useGuidance } from '@/context/GuidanceProvider';
import { categoriesApi } from '@/services/client/categoriesApi';
import { UnitsDisplay, QuantityDisplay } from './DisplayComponents';
import ArrowSquareRightIcon from '@/icons/arrow-square-right.svg';

import styles from './components.module.css';

interface EntryRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offer: any;
  isEven?: boolean;
}

const cellClass = (isHovered: boolean): string => {
  return isHovered ? `${styles.estimationItem} ${styles.estimationItemHovered}` : styles.estimationItem;
};

const actionClass = (isHovered: boolean): string => {
  return isHovered ? `${styles.actionCell} ${styles.actionCellHovered}` : styles.actionCell;
};

export const EntryRow = (props: EntryRowProps) => {
  const { setCustomGuidance, focusedField } = useGuidance();
  const [isHovered, setIsHovered] = useState(false);
  const { data: entry } = categoriesApi.useGetEntryQuery(props.offer.entryId, {
    skip: !props.offer.entryId,
  });

  const isActive = focusedField?.label === props.offer.item;

  const handleClick = () => {
    setCustomGuidance({
      label: props.offer.item,
      shortDescription: entry?.shortDescription || '',
      description: entry?.description || '',
    });
  };

  const active = isActive || isHovered;
  const rowBg = active ? 'var(--bg-blue-subsection)' : props.isEven ? '#fdfdfd' : '#fff';

  return (
    <div
      className={styles.rowWrapper}
      style={{ '--row-bg': rowBg, cursor: 'pointer' } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={cellClass(active)} style={{ justifyContent: 'center' }} />
      <div
        className={cellClass(active)}
        style={{ justifyContent: 'flex-start', textAlign: 'left', alignItems: 'flex-start' }}
      >
        <Flex vertical>
          <Typography.Text style={{ fontWeight: 600 }}>{props.offer.item}</Typography.Text>
          {entry?.shortDescription && <div className={styles.itemDescription}>{entry.shortDescription}</div>}
        </Flex>
      </div>
      <div className={cellClass(active)}>{formatCurrency(props.offer.clientPrice)}</div>
      <div className={cellClass(active)} style={{ justifyContent: 'center' }}>
        <UnitsDisplay units={props.offer.units} />
      </div>
      <div className={cellClass(active)} style={{ justifyContent: 'center' }}>
        <QuantityDisplay units={props.offer.units} />
      </div>
      <div className={cellClass(active)} style={{ justifyContent: 'flex-end', fontWeight: 600 }}>
        {formatCurrency(props.offer.clientCost)}
      </div>
      <div className={actionClass(active)}>
        {isActive && <ArrowSquareRightIcon style={{ color: 'var(--gray-light)', width: 16, height: 16 }} />}
      </div>
    </div>
  );
};
