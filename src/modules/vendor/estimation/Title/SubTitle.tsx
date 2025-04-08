'use client';

import { useExpandedKeys } from '../context/expanded';
import { RowLine } from '../RowLine';
import { ArrowButton } from './ArrowButton';
import { Flex } from 'antd';
import { SectionSubTitle, SectionSubTitleText, SectionSubTitleSumHeader } from './styled';

export const SubTitle = ({ text, itemKey }: { text: string; itemKey: string }) => {
	const { keys, switchKey } = useExpandedKeys();
	const isOpen = !!keys?.includes(itemKey);
	const handleClick = () => switchKey(itemKey);

	return (
		<>
			<div style={{ backgroundColor: 'var(--white)' }} />
			<SectionSubTitle style={{ gridColumn: isOpen ? 'span 6' : 'span 4' }}>
				<Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
					<ArrowButton isOpen={isOpen} />
					<SectionSubTitleText>{text}</SectionSubTitleText>
				</Flex>
			</SectionSubTitle>
			{!isOpen && (
				<>
					<SectionSubTitleSumHeader>$ 4,740.0</SectionSubTitleSumHeader>
					<div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
				</>
			)}
			<div />
			<SectionSubTitle style={{ gridColumn: 'span 5' }} />
			<RowLine />
		</>
	);
};
