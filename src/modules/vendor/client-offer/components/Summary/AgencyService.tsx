'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectClientTotalSum, selectTotalSum } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { AgencyServiceRow } from '../styled';
import { styled } from 'styled-components';

const AgencyLabel = styled.span`
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: #4B5675;
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
`;

const PercentWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90px;
`;

const ValueWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 110px;
    padding-right: 2px;
`;

const PercentValue = styled.span`
    font-weight: 500;
    font-size: 13px;
    color: #99A1B7;
`;

const PercentSign = styled.span`
    font-weight: 500;
    font-size: 10px;
    color: #99A1B7;
    margin-left: 3px;
    margin-top: 2px;
`;

const AgencyValue = styled.span`
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #4B5675;
`;

export const AgencyService = () => {
    const { value: vendorTotal } = useAppSelector(selectTotalSum);
    const { value: clientTotal } = useAppSelector(selectClientTotalSum);

    const agencyServiceAmount = clientTotal - vendorTotal;

    if (agencyServiceAmount <= 0) return null;

    const surchargePercent = vendorTotal > 0
        ? Math.round(((clientTotal / vendorTotal) - 1) * 100 * 10) / 10
        : 0;

    return (
        <AgencyServiceRow>
            <AgencyLabel>{t('AGENCY_SERVICE')}</AgencyLabel>
            <RightSection>
                <PercentWrapper>
                    <PercentValue>{surchargePercent}</PercentValue>
                    <PercentSign>%</PercentSign>
                </PercentWrapper>
                <ValueWrapper>
                    <AgencyValue>{formatCurrency(agencyServiceAmount)}</AgencyValue>
                </ValueWrapper>
            </RightSection>
        </AgencyServiceRow>
    );
};
