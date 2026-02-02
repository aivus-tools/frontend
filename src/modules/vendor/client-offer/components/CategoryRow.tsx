'use client';

import React from 'react';
import { styled } from 'styled-components';
import { Typography } from 'antd';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
`;

const Name = styled(Typography.Text)`
  font-weight: 700;
  font-size: 14px;
  color: var(--main);
  text-transform: uppercase;
`;

interface Props {
    name: string;
}

export const CategoryRow = ({ name }: Props) => {
    return (
        <Wrapper>
            <Name>{name}</Name>
        </Wrapper>
    );
};
