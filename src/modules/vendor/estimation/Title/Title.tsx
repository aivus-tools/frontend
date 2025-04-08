'use client';

import type { Category } from '../types';
import { useExpandedKeys } from '../context/expanded';
import { useState } from 'react';
import { Flex } from 'antd';
import { RowLine } from '../RowLine';
import { LinkButton } from './LinkButtons';
import { ArrowButton } from './ArrowButton';
import { SectionTitle, SectionTitlePercentHeader, SectionTitleSumHeader, SectionTitleText } from './styled';

export const Title = ({ category, itemKey }: { category: Category; itemKey: string }) => {
	const { keys, switchKey } = useExpandedKeys();
	const isOpen = !!keys?.includes(itemKey);
	const [isLink, setIsLink] = useState(false);
	const handleLink = () => setIsLink((prev) => !prev);
	const handleClick = () => switchKey(itemKey);

	return (
		<>
			<SectionTitle style={{ gridColumn: isOpen ? 'span 7' : 'span 5' }} $isOpen={isOpen}>
				<Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
					<ArrowButton isOpen={isOpen} />
					<SectionTitleText>{category.name}</SectionTitleText>
				</Flex>
			</SectionTitle>
			{!isOpen && (
				<>
					<SectionTitleSumHeader>$ 4,740.0</SectionTitleSumHeader>
					<div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
				</>
			)}
			<div />
			<>
				<Flex
					align='center'
					justify='center'
					style={{ backgroundColor: 'var(--white)', borderRadius: isOpen ? '6px 0 0 0' : '6px 0 0 6px' }}
				>
					<LinkButton link={isLink} onClickAction={handleLink} />
				</Flex>
				<SectionTitlePercentHeader>10 %</SectionTitlePercentHeader>
			</>
			<SectionTitle style={{ gridColumn: 'span 3', borderRadius: isOpen ? '0 6px 0 0' : '0 6px 6px 0' }} />
			{isOpen && <RowLine />}
		</>
	);
};
