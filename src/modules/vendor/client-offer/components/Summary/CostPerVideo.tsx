'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal, selectShowCostPerVideo } from '@/store/slices/offer/selectors';
import { useBrief } from '@/hooks/useBrief';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { CostPerVideoRow } from '../styled';
import { styled } from 'styled-components';

const CostLabel = styled.span`
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: #99A1B7;
`;

const CostValue = styled.span`
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #99A1B7;
`;

export const CostPerVideo = () => {
    const { data: brief } = useBrief();
    const isVisible = useAppSelector(selectShowCostPerVideo);
    const { clientTotalValue } = useAppSelector(selectGrandTotal);

    if (!isVisible || !brief) return null;

    const { number } = brief.details?.mainVideoDuration || {};
    const countOfVideos = Number.isFinite(Number(number)) && Number(number) > 0 ? Number(number) : 1;

    const costPerVideo = clientTotalValue / countOfVideos;

    return (
        <CostPerVideoRow>
            <CostLabel>{t('COST_PER_VIDEO', String(countOfVideos))}</CostLabel>
            <CostValue>{formatCurrency(costPerVideo)}</CostValue>
        </CostPerVideoRow>
    );
};
