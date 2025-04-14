'use client';

import type { Category } from '../types';
import { useExpandedKeys } from '../context/expanded';
import { useCallback } from 'react';
import { Flex } from 'antd';
import { RowLine } from '../RowLine';
import { LinkButton } from './LinkButtons';
import { ArrowButton } from './ArrowButton';
import { SectionTitle, SectionTitleSumHeader, SectionTitleText } from './styled';
import { changeCategorySurcharge, selectCategorySurcharge, selectTotalSumByCategoryId } from '@/store/slices/offer';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { InputNumberRight } from '../styled';
import { percentFormat, percentParser } from '../helpers/format';

export const Title = ({ category, itemKey }: { category: Category; itemKey: string }) => {
	const dispatch = useAppDispatch();
	const { keys, switchKey } = useExpandedKeys();
	const isOpen = !!keys?.includes(itemKey);
	const { linked, surcharge } = useAppSelector(
		useCallback((state: RootState) => selectCategorySurcharge(state, category.id), [category.id])
	);

	const handleLink = () => {
		dispatch(changeCategorySurcharge({ categoryId: category.id, linked: !linked }));
	};
	const handleSurcharge = (value: number | null) => {
		if (value !== null) {
			dispatch(changeCategorySurcharge({ categoryId: category.id, surcharge: value }));
		}
	};
	const handleClick = () => switchKey(itemKey);

	const total = useAppSelector(
		useCallback((state: RootState) => selectTotalSumByCategoryId(state, category.id), [category.id])
	);

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
					<SectionTitleSumHeader>{total}</SectionTitleSumHeader>
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
					<LinkButton link={linked} onClickAction={handleLink} />
				</Flex>
				<Flex align='center' justify='center' style={{ backgroundColor: 'var(--white)', padding: '2px' }}>
					<InputNumberRight
						variant='borderless'
						onChange={handleSurcharge}
						controls={false}
						value={surcharge}
						formatter={percentFormat}
						parser={percentParser}
					/>
				</Flex>
			</>
			<SectionTitle style={{ gridColumn: 'span 3', borderRadius: isOpen ? '0 6px 0 0' : '0 6px 6px 0' }} />
			{isOpen && <RowLine />}
		</>
	);
};
