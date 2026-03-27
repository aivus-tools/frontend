'use client';

import React from 'react';
import { CategoryTotalRow } from '../styled';
import { t } from '@/lib/i18n';
import { styled } from 'styled-components';

const TotalLabel = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: var(--main);
    text-transform: uppercase;
`;

const TotalValue = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 19.5px;
    color: var(--blue);
`;

interface Props {
    text: string;
    value: string;
}

export const Total = ({ text, value }: Props) => {
    return (
        <CategoryTotalRow>
            <TotalLabel>{text} {t('TOTAL')}:</TotalLabel>
            <TotalValue>{value}</TotalValue>
        </CategoryTotalRow>
    );
};
