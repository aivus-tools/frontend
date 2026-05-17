'use client';

import React from 'react';
import { Flex } from 'antd';

import styles from './DisplayComponents.module.css';

interface UnitProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  units: any[];
}

export const UnitsDisplay = (props: UnitProps) => {
  return (
    <Flex vertical gap={2} style={{ width: '100%' }}>
      {props.units?.map((unit, index) => (
        <div key={index} className={styles.unitRow}>
          {unit.label}
        </div>
      ))}
    </Flex>
  );
};

export const QuantityDisplay = (props: UnitProps) => {
  return (
    <Flex vertical gap={2} style={{ width: '100%' }}>
      {props.units?.map((unit, index) => (
        <div key={index} className={styles.quantityValue}>
          {unit.count}
        </div>
      ))}
    </Flex>
  );
};
