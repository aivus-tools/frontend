'use client';

import React from 'react';
import type { Category } from '@/types/estimation.interface';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { Flex } from 'antd';
import { SectionTitle, SectionTitleSumHeader, SectionTitleText, RowLine } from '../styled';
import { ArrowButton } from '@/modules/vendor/estimation/components/Title/ArrowButton';

interface Props {
    category: Category;
    itemKey: string;
    value: string;
}

export const Title = ({ category, itemKey, value }: Props) => {
    const { keys, switchKey } = useExpandedKeys();
    const isOpen = !!keys?.includes(itemKey);
    const handleClick = () => switchKey(itemKey);

    return (
        <>
            <SectionTitle style={{ gridColumn: isOpen ? 'span 5' : 'span 2' }} $isOpen={isOpen}>
                <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
                    <ArrowButton isOpen={isOpen} />
                    <SectionTitleText>{category.name}</SectionTitleText>
                </Flex>
            </SectionTitle>
            {!isOpen && (
                <>
                    <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
                    <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
                    <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
                    <SectionTitleSumHeader style={{ backgroundColor: 'var(--bg-blue-subsection)', justifyContent: 'flex-end', paddingRight: 10 }}>
                        {value}
                    </SectionTitleSumHeader>
                    <div style={{ backgroundColor: 'var(--bg-blue-subsection)', borderRadius: '0 6px 6px 0' }} />
                </>
            )}
            {isOpen && (
                <>
                    <SectionTitle />
                    <SectionTitle style={{ borderRadius: '0 6px 0 0' }} />
                </>
            )}
            {isOpen && (
                <>
                    <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
                    <RowLine $dark />
                    <div style={{ backgroundColor: '#fff' }} />
                </>
            )}
        </>
    );
};
