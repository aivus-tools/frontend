'use client';

import type { Category, Category as CategoryType } from './types';
import { Entries } from './Entries';
import { useExpandedKeys } from './context/expanded';
import { SubTotal } from './Total/SubTotal';
import { Total } from './Total/Total';
import { Title } from './Title/Title';
import { SubTitle } from './Title/SubTitle';
import { useCategories } from '@/hooks/useCategories';
import { useOffers } from '@/hooks/useOffers';
import { useEntries } from '@/hooks/useEntries';
import { mapEntriesToDropdownItems } from './helpers';

export function Category({ category }: { category: CategoryType }) {
	const { data: offers } = useOffers();
	const { data: categories } = useCategories();
	const { data: entries } = useEntries();
	const subCategories = categories?.filter((c) => c.parentCategoryId === category.id);

	const { keys } = useExpandedKeys();
	const isOpen = keys?.includes(category.id);

	const categoryOffers = offers?.filter((o) => o.categoryId === category.id);
	const currentEntries = entries?.filter((e) => e.categoryId === category.id) ?? [];
	const dropDownItems = mapEntriesToDropdownItems(currentEntries);

	return (
		<>
			<Title category={category} />
			{isOpen && (
				<>
					{subCategories?.map((subCategory) => {
						const isOpen = keys?.includes(subCategory.id);
						const subCategoryOffers = offers?.filter((o) => o.categoryId === subCategory.id);
						const currentSubEntries = entries?.filter((e) => e.categoryId === subCategory.id) ?? [];
						const dropDownItems = mapEntriesToDropdownItems(currentSubEntries);

						return (
							<>
								<SubTitle text={subCategory.name} id={subCategory.id} />
								{isOpen && <Entries data={subCategoryOffers} items={dropDownItems} />}
							</>
						);
					})}
					<Entries data={categoryOffers} items={dropDownItems} />
					<SubTotal value='$ 4,740.0' />
					<Total text={category.name} value='$ 4,740.0' />
				</>
			)}
			<div style={{ gridColumn: 'span 11', padding: '15px' }} />
		</>
	);
}
