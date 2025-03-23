'use client';

import { Dropdown } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { OfferData } from '../types';
import { useRowHover } from '../context/hover';
import { useSearchLibrary } from '../hooks/useSearchLibrary';
import debounce from 'lodash.debounce';
import { SearchProvider } from './SearchContext';
import { ValueSetter } from './ValueSetter';

interface ComponentParams {
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleBlur: () => void;
	handleFocus: () => void;
	value: string;
}

interface Props {
	value?: OfferData;
	componentAction: (props: ComponentParams) => React.ReactNode;
	onSelect?: (value: OfferData) => void;
}

export const LibraryDropdown = ({ value, componentAction, onSelect }: Props) => {
	const { focusRow } = useRowHover();
	const [isTyping, setIsTyping] = useState(false);
	const [searchValue, setSearchValue] = useState('');

	const library = useSearchLibrary();
	const items = useMemo(() => {
		if (!library) return [];
		const result = library.filter((it) => it.value.toLowerCase().includes(searchValue.toLowerCase()));
		return result.slice(0, 10);
	}, [library, searchValue]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedIsTyping = useCallback(debounce(setIsTyping, 300), []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		debouncedIsTyping(Boolean(e.currentTarget.value));
		setSearchValue(e.currentTarget.value);
	};

	const handleBlur = () => {
		focusRow(null);
		setIsTyping(false);
	};

	const handleFocus = () => {
		focusRow(value?.id ?? null);
	};

	const handleSelect = (item: OfferData) => {
		onSelect?.(item);
		setIsTyping(false);
		setSearchValue('');
	};

	return (
		<SearchProvider activeKey={items[0]?.key}>
			<ValueSetter isTyping={isTyping} onSelect={handleSelect} items={items}>
				<Dropdown open={isTyping} menu={{ items }}>
					<div>
						{componentAction({
							handleChange,
							handleBlur,
							handleFocus,
							value: !isTyping && value ? value.item : searchValue,
						})}
					</div>
				</Dropdown>
			</ValueSetter>
		</SearchProvider>
	);
};
