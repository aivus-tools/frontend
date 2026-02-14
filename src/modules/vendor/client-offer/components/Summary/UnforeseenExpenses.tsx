'use client';

import React from 'react';
import { Flex } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { selectUnforeseenExpenses } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';
import { Label, TotalSum, RowWrapper } from '../styled';

export const UnforeseenExpenses = () => {
    const { isVisible, clientTotal } = useAppSelector(selectUnforeseenExpenses);

    if (!isVisible) return null;

    return (
        <RowWrapper $bg='var(--white)'>
            <div style={{ borderRadius: '6px 0 0 6px' }} />
            <Flex
                style={{ gridColumn: 'span 4', paddingRight: '20px' }}
                justify='flex-end'
                align='center'
            >
                <Label style={{ fontWeight: 500, fontSize: 13 }}>
                    {t('UNFORESEEN_EXPENSES')}
                </Label>
            </Flex>
            <div style={{ borderRadius: '0 6px 6px 0' }}>
                <TotalSum style={{ fontSize: 13 }}>{clientTotal}</TotalSum>
            </div>
        </RowWrapper>
    );
};
