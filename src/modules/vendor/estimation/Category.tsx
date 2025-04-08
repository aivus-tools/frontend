'use client';

import type { Category as TypeCategory } from './types';
import { Entries } from './Entries';
import { useExpandedKeys } from './context/expanded';
import { SubTotal } from './Total/SubTotal';
import { Total } from './Total/Total';
import { Title } from './Title/Title';
import { SubCategory } from './SubCategory';
import { useAppSelector } from '@/lib/hooks';
import { selectSubcategoryById, selectOffersByCategoryId } from '@/store/slices/offer';
import { useCallback } from 'react';
import { RootState } from '@/lib/store';

export function Category({ category }: { category: TypeCategory }) {
	const { keys } = useExpandedKeys();
	const key = `${category.id}`;
	const isOpen = keys?.includes(key);
	const subCategories = useAppSelector(
		useCallback((state: RootState) => selectSubcategoryById(state, category.id), [category.id])
	);
	const offers = useAppSelector(
		useCallback((state: RootState) => selectOffersByCategoryId(state, category.id), [category.id])
	);

	return (
		<>
			<Title category={category} itemKey={key} />
			{isOpen && (
				<>
					{subCategories?.map((subCategory) => (
						<SubCategory key={`${key}${subCategory.id}`} subCategory={subCategory} />
					))}
					<Entries data={offers} />
					<SubTotal value='$ 4,740.0' />
					<Total text={category.name} value='$ 4,740.0' />
				</>
			)}
			<div style={{ gridColumn: 'span 13', padding: '15px' }} />
		</>
	);
}
