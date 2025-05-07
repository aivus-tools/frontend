import React, { useMemo, ReactNode } from 'react';
import { Label } from '../LibraryDropdown/Label';
import { categoriesApi } from '@/services/client/categoriesApi';
import { Entry } from '@/types/entries';

export interface MenuItem extends Entry {
	key: string;
	label: string | ReactNode;
	value: string;
	active?: boolean;
	path?: string;
	name: string;
}

export const useSearchLibrary = () => {
	const { data: categories } = categoriesApi.useGetCategoriesQuery();
	const { data: entriesRes } = categoriesApi.useGetEntriesQuery();

	return useMemo(
		() =>
			entriesRes?.entries?.reduce((acc: MenuItem[], entry) => {
				const category = categories?.find((cat) => cat.id === entry.categoryId);
				if (!category) return acc;

				acc.push({
					...entry,
					key: `${category.id}-${entry.id}`,
					label: <Label itemKey={`${category.id}-${entry.id}`}>{`${entry.name}`}</Label>,
					value: `${entry.name}`,
					name: entry.name,
				});

				return acc;
			}, []),

		[categories, entriesRes]
	);
};
