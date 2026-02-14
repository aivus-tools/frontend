'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectClientTotalSum } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';
import { SummaryRow } from '../styled';
import { styled } from 'styled-components';

const SummaryLabel = styled.span`
    font-weight: 700;
    font-size: 14px;
    line-height: 17px;
    color: var(--main);
`;

const SummaryValue = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 19.5px;
    color: var(--main);
`;

export const SubtotalAllSections = () => {
    const { formatted: totalClient } = useAppSelector(selectClientTotalSum);

    return (
        <SummaryRow>
            <SummaryLabel>{t('SUBTOTAL_FOR_ALL_SECTIONS')}</SummaryLabel>
            <SummaryValue>{totalClient}</SummaryValue>
        </SummaryRow>
    );
};
