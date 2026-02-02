'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectClientTotalSum, selectOverallSurcharge } from '@/store/slices/offer/selectors';
import { applyPercentage, formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { AgencyServiceRow } from '../styled';
import { styled } from 'styled-components';

const AgencyLabel = styled.span`
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: var(--main);
`;

const AgencyPercent = styled.span`
    font-size: 13px;
    color: #99A1B7;
    margin-left: 16px;
`;

const AgencyValue = styled.span`
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: var(--main);
`;

export const AgencyService = () => {
    const { value: clientTotal } = useAppSelector(selectClientTotalSum);
    const { surcharge } = useAppSelector(selectOverallSurcharge);

    if (!surcharge || surcharge === 0) return null;

    const agencyServiceAmount = applyPercentage(clientTotal, surcharge);

    return (
        <AgencyServiceRow>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <AgencyLabel>{t('AGENCY_SERVICE')}</AgencyLabel>
                <AgencyPercent>{surcharge} %</AgencyPercent>
            </div>
            <AgencyValue>{`$ ${formatCurrency(agencyServiceAmount)}`}</AgencyValue>
        </AgencyServiceRow>
    );
};
