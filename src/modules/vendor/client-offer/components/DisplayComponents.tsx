'use client';

import React from 'react';
import { Flex } from 'antd';
import { styled } from 'styled-components';

const UnitRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  color: var(--main);
  white-space: nowrap;
`;

const QuantityValue = styled.div`
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  color: var(--main);
  text-align: center;
`;

interface UnitProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    units: any[];
}

export const UnitsDisplay = ({ units }: UnitProps) => {
    return (
        <Flex vertical gap={2} style={{ width: '100%' }}>
            {units?.map((unit, index) => (
                <UnitRow key={index}>{unit.label}</UnitRow>
            ))}
        </Flex>
    );
};

export const QuantityDisplay = ({ units }: UnitProps) => {
    return (
        <Flex vertical gap={2} style={{ width: '100%' }}>
            {units?.map((unit, index) => (
                <QuantityValue key={index}>{unit.count}</QuantityValue>
            ))}
        </Flex>
    );
};
