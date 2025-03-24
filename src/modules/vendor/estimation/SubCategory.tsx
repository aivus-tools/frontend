'use client';

import type { Category } from './types';
import { Entries } from './Entries';
import { useExpandedKeys } from './context/expanded';
import { SubTitle } from './Title/SubTitle';
import { selectOffersByCategoryId } from '@/store/slices/offer';
import { RootState } from '@/lib/store';
import { useCallback } from 'react';
import { useAppSelector } from '@/lib/hooks';

export function SubCategory({ subCategory }: { subCategory: Category }) {
	const { keys } = useExpandedKeys();
	const key = `${subCategory.parentCategoryId}-${subCategory.id}`;
	const isOpen = keys?.includes(key);
	const offers = useAppSelector(
		useCallback((state: RootState) => selectOffersByCategoryId(state, subCategory.id), [subCategory.id])
	);
	return (
		<>
			<SubTitle text={subCategory.name} itemKey={key} />
			{isOpen && <Entries data={offers} />}
		</>
	);
}
