'use client';

import { Input as LibInput, Dropdown } from 'antd';
import { useMemo, useState } from 'react';
import { styled } from 'styled-components';
import { OfferData } from './types';
import { useRowHover } from './context/hover';
import { useCategories } from '@/hooks/useCategories';
import { useEntries } from '@/hooks/useEntries';

type MenuItem = {
	key: string;
	label: string;
};

const Input = styled(LibInput)`
	&.ant-input-borderless {
		border: 1px solid transparent;
	}

	&.ant-input-borderless:focus {
		border: 1px solid var(--blue);
	}
`;

interface Props {
	value: OfferData;
}

export const EntrieInput = ({ value: initialValue }: Props) => {
	const { focusRow } = useRowHover();
	const [isTyping, setIsTyping] = useState(false);
	const [value, setValue] = useState(initialValue);
	const [searchValue, setSearchValue] = useState('');

	const library = useSearchLibrary();
	const items = useMemo(() => {
		if (!library) return [];
		return library.filter((it) => it.label.toLowerCase().includes(searchValue.toLowerCase()));
	}, [library, searchValue]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsTyping(true);
		setSearchValue(e.currentTarget.value);
	};

	const handleBlur = () => {
		focusRow(null);
		setIsTyping(false);
	};

	const handleFocus = () => {
		focusRow(value.id);
	};

	return (
		<Dropdown open={isTyping} menu={{ items }}>
			<Input
				placeholder='Borderless'
				variant='borderless'
				value={!isTyping && value ? value.item : searchValue}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
			/>
		</Dropdown>
	);
};

const useSearchLibrary = () => {
	const { data: categories } = useCategories();
	const { data: entries } = useEntries();

	return useMemo(
		() =>
			categories?.reduce((acc: MenuItem[], val) => {
				acc?.push({
					key: val.id.toString(),
					label: val.name,
				});

				const children = entries
					?.filter((entry) => entry.categoryId === val.id)
					.map((entry) => ({
						key: entry.id.toString(),
						label: `${val.name} | ${entry.name}`,
					}));

				if (children) {
					acc?.push(...children);
				}

				return acc;
			}, []),
		[categories, entries]
	);
};
