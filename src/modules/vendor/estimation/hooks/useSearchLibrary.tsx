import { useCategories } from '@/hooks/useCategories';
import { useEntries } from '@/hooks/useEntries';
import React, { useMemo, ReactNode } from 'react';
import { Label } from '../LibraryDropdown/Label';

export type MenuItem = {
	key: string;
	label: string | ReactNode;
	value: string;
	active?: boolean;
	path?: string;
	name: string;
};

export const useSearchLibrary = () => {
	const { data: categories } = useCategories();
	const { data: entries } = useEntries();

	return useMemo(
		() =>
			entries?.reduce((acc: MenuItem[], entry) => {
				const category = categories?.find((cat) => cat.id === entry.categoryId);
				if (!category) return acc;

				acc.push({
					key: `${category.id}-${entry.id}`,
					label: <Label itemKey={`${category.id}-${entry.id}`}>{`${entry.name}`}</Label>,
					value: `${entry.name}`,
					name: entry.name,
				});

				return acc;
			}, []),

		[categories, entries]
	);
};
