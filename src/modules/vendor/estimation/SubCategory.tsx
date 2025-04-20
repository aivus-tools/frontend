'use client';

import type { Category } from './types';
import { Entries } from './Entries';
import { useExpandedKeys } from './context/expanded';
import { SubTitle } from './Title/SubTitle';
import { selectOffersByCategoryId, selectTotalSumByCategoryId } from '@/store/slices/offer';
import { RootState } from '@/lib/store';
import { useCallback } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { SubTotal } from './Total/SubTotal';

export function SubCategory({ subCategory }: { subCategory: Category }) {
	const { keys } = useExpandedKeys();
	const key = `${subCategory.parentCategoryId}-${subCategory.id}`;
	const isOpen = keys?.includes(key);
	const offers = useAppSelector(
		useCallback((state: RootState) => selectOffersByCategoryId(state, subCategory.id), [subCategory.id])
	);

	const { total, clientTotal } = useAppSelector(
		useCallback((state: RootState) => selectTotalSumByCategoryId(state, subCategory.id), [subCategory.id])
	);

	return (
		<>
			<SubTitle text={subCategory.name} itemKey={key} value={`$ ${total}`} clientValue={`$ ${clientTotal}`} />
			{isOpen && (
				<>
					<Entries data={offers} />
					<SubTotal value={`$ ${total}`} clientValue={`$ ${clientTotal}`} />
				</>
			)}
		</>
	);
}
