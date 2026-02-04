'use client';

import React from 'react';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { Flex } from 'antd';
import { SectionSubTitle, SectionSubTitleText, SectionSubTitleSumHeader, RowLine } from '../styled';
import { ArrowButton } from '@/modules/vendor/estimation/componnets/Title/ArrowButton';

interface Props {
    text: string;
    itemKey: string;
    value: string;
}

export const SubTitle = ({ text, itemKey, value }: Props) => {
    const { keys, switchKey } = useExpandedKeys();
    const isOpen = !!keys?.includes(itemKey);
    const handleClick = () => switchKey(itemKey);

    return (
        <>
            <div style={{ backgroundColor: '#fff' }} />
            <SectionSubTitle style={{ gridColumn: isOpen ? 'span 4' : 'span 1' }}>
                <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
                    <ArrowButton isOpen={isOpen} />
                    <SectionSubTitleText>{text}</SectionSubTitleText>
                </Flex>
            </SectionSubTitle>
            {!isOpen && (
                <>
                    <div style={{ backgroundColor: '#fff' }} />
                    <div style={{ backgroundColor: '#fff' }} />
                    <div style={{ backgroundColor: '#fff' }} />
                    <SectionSubTitleSumHeader style={{ backgroundColor: '#fff', paddingRight: 2 }}>
                        {value}
                    </SectionSubTitleSumHeader>
                    <div style={{ backgroundColor: '#fff' }} />
                </>
            )}
            {isOpen && (
                <>
                    <div style={{ backgroundColor: '#fff' }} />
                    <div style={{ backgroundColor: '#fff' }} />
                </>
            )}
            {isOpen && (
                <>
                    <div style={{ backgroundColor: '#fff' }} />
                    <RowLine />
                    <div style={{ backgroundColor: '#fff' }} />
                </>
            )}
        </>
    );
};
