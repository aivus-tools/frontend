'use client';

import React from 'react';
import { Flex } from 'antd';
import { SubTotalRow, Label, TotalSum } from '../styled';
import { t } from '@/lib/i18n';

interface Props {
    name: string;
    value: string;
    subCategoryId?: string;
}

export const SubTotal = ({ name, value }: Props) => {
    return (
        <SubTotalRow>
            <div />
            <Flex style={{ gridColumn: 'span 4', paddingRight: 20 }} justify='flex-end' align='center'>
                <Label style={{ fontSize: 12, padding: '12px 0', textTransform: 'none', color: 'var(--gray)' }}>
                    {t('SUBTOTAL_OF_LOCATIONS', name)}:
                </Label>
            </Flex>
            <div>
                <TotalSum style={{ fontSize: 14, padding: '12px 10px 12px 0', color: 'var(--blue)' }}>{value}</TotalSum>
            </div>
        </SubTotalRow>
    );
};
