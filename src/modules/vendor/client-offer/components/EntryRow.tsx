'use client';

import React, { useState } from 'react';
import { Typography , Flex } from 'antd';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useGuidance } from '@/context/GuidanceProvider';
import { categoriesApi } from '@/services/client/categoriesApi';
import { EstimationItem, RowWrapper, ItemDescription } from './styled';
import { UnitsDisplay, QuantityDisplay } from './DisplayComponents';
import { RightSquareOutlined } from '@ant-design/icons';

interface Props {
    offer: any;
    isEven?: boolean;
}

export const EntryRow = ({ offer, isEven }: Props) => {
    const { setCustomGuidance, focusedField } = useGuidance();
    const [isHovered, setIsHovered] = useState(false);
    const { data: entry } = categoriesApi.useGetEntryQuery(offer.entryId, {
        skip: !offer.entryId,
    });

    const isActive = focusedField?.label === offer.item;

    const handleClick = () => {
        setCustomGuidance({
            label: offer.item,
            description: entry?.description || t('DESCRIPTION'),
        });
    };

    return (
        <RowWrapper
            $hovered={isActive || isHovered}
            $isEven={isEven}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <EstimationItem $hovered={isActive || isHovered} style={{ justifyContent: 'center' }}>
                {isActive && <RightSquareOutlined style={{ color: 'var(--blue)', fontSize: 16 }} />}
            </EstimationItem>
            <EstimationItem $hovered={isActive || isHovered} style={{ justifyContent: 'flex-start', textAlign: 'left', alignItems: 'flex-start' }}>
                <Flex vertical>
                    <Typography.Text style={{ fontWeight: 600 }}>{offer.item}</Typography.Text>
                    {entry?.description && (
                        <ItemDescription>{entry.description}</ItemDescription>
                    )}
                </Flex>
            </EstimationItem>
            <EstimationItem $hovered={isActive || isHovered}>
                {formatCurrency(offer.clientPrice)}
            </EstimationItem>
            <EstimationItem $hovered={isActive || isHovered} style={{ justifyContent: 'center' }}>
                <UnitsDisplay units={offer.units} />
            </EstimationItem>
            <EstimationItem $hovered={isActive || isHovered} style={{ justifyContent: 'center' }}>
                <QuantityDisplay units={offer.units} />
            </EstimationItem>
            <EstimationItem $hovered={isActive || isHovered} style={{ paddingRight: 10 }}>
                {`$ ${formatCurrency(offer.clientCost)}`}
            </EstimationItem>
        </RowWrapper>
    );
};
