import { useCategories } from '@/hooks/useCategories';
import { useEntries } from '@/hooks/useEntries';
import { useMemo } from 'react';
import { Label } from '../LibraryDropdown/Label';

export type MenuItem = {
	key: string;
	label: string | JSX.Element;
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
			categories?.reduce((acc: MenuItem[], category) => {
				acc?.push({
					key: `${category.id}`,
					label: <Label itemKey={`${category.id}`}>{category.name}</Label>,
					value: category.name,
					name: category.name,
				});

				const children = entries
					?.filter((entry) => entry.categoryId === category.id)
					.map((entry) => ({
						key: `${category.id}-${entry.id}`,
						label: <Label itemKey={`${category.id}-${entry.id}`}>{`${category.name} | ${entry.name}`}</Label>,
						value: `${category.name} | ${entry.name}`,
						name: entry.name,
					}));

				if (children) {
					acc?.push(...children);
				}

				return acc;
			}, []),
		[categories, entries]
	);
};
