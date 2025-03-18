'use client';

import type { OfferCategory } from './types';
import { Entries } from './Entries';
import { useExpandedKeys } from './context/expanded';
import { SubTitle } from './Title/SubTitle';

export function SubCategory({ subCategory }: { subCategory: OfferCategory }) {
	const { keys } = useExpandedKeys();
	const isOpen = keys?.includes(subCategory.id);

	return (
		<>
			<SubTitle text={subCategory.name} id={subCategory.id} />
			{isOpen && <Entries data={subCategory.offers} />}
		</>
	);
}
