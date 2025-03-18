'use client';

import type { Category, OfferCategory } from './types';
import { Entries } from './Entries';
import { useExpandedKeys } from './context/expanded';
import { SubTotal } from './Total/SubTotal';
import { Total } from './Total/Total';
import { Title } from './Title/Title';
import { SubCategory } from './SubCategory';

export function Category({ category }: { category: OfferCategory }) {
	const { keys } = useExpandedKeys();
	const isOpen = keys?.includes(category.id);

	const { subCategories, offers } = category;

	return (
		<>
			<Title category={category} />
			{isOpen && (
				<>
					{subCategories?.map((subCategory) => <SubCategory key={subCategory.id} subCategory={subCategory} />)}
					<Entries data={offers} />
					<SubTotal value='$ 4,740.0' />
					<Total text={category.name} value='$ 4,740.0' />
				</>
			)}
			<div style={{ gridColumn: 'span 13', padding: '15px' }} />
		</>
	);
}
