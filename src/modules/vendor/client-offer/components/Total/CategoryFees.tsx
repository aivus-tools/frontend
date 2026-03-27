'use client';

import React, { useCallback } from 'react';
import { styled } from 'styled-components';
import { useAppSelector } from '@/store/hooks';
import { selectCategoryFees, FeeRow } from '@/store/slices/offer/selectors';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/store/store';

const FeeRowWrapper = styled.div`
    grid-column: span 7;
    display: flex;
    padding: 8px 40px 8px 14px;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    background: #fff;
`;

const FeeLabel = styled.span`
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color: #99A1B7;
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const PercentText = styled.span`
    font-weight: 500;
    font-size: 11px;
    color: #C4CADA;
`;

const FeeValue = styled.span`
    font-weight: 500;
    font-size: 12px;
    color: #4B5675;
    min-width: 80px;
    text-align: right;
`;

interface CategoryFeesProps {
    categoryId: string;
}

export const CategoryFees: React.FC<CategoryFeesProps> = props => {
    const fees = useAppSelector(
        useCallback((state: RootState) => selectCategoryFees(state, props.categoryId), [props.categoryId])
    );

    if (fees.length === 0) {
        return null;
    }

    return (
        <>
            {fees.map((fee: FeeRow) => (
                <FeeRowWrapper key={fee.key}>
                    <FeeLabel>{fee.name}</FeeLabel>
                    <RightSection>
                        <PercentText>{fee.percent}%</PercentText>
                        <FeeValue>{formatCurrency(fee.clientAmount)}</FeeValue>
                    </RightSection>
                </FeeRowWrapper>
            ))}
        </>
    );
};
