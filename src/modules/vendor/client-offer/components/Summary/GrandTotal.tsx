'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';
import { GrandTotalRow } from '../styled';
import { styled } from 'styled-components';

const GrandTotalLabel = styled.span`
    font-weight: 700;
    font-size: 14px;
    line-height: 17px;
    color: var(--main);
    text-transform: uppercase;
    padding-left: 8px;
`;

const GrandTotalValue = styled.span`
    font-weight: 700;
    font-size: 18px;
    line-height: 22px;
    color: var(--green);
`;

export const GrandTotal = () => {
    const { clientTotal } = useAppSelector(selectGrandTotal);

    return (
        <GrandTotalRow>
            <GrandTotalLabel>{t('GRAND_TOTAL')}</GrandTotalLabel>
            <GrandTotalValue>{clientTotal}</GrandTotalValue>
        </GrandTotalRow>
    );
};
