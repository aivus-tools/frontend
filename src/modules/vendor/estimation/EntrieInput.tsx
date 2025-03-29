'use client';

import { Input as LibInput } from 'antd';
import { styled } from 'styled-components';
import { OfferData } from './types';
import { LibraryDropdown } from './LibraryDropdown/LibraryDropdown';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeOfferRow, addOfferRow, selectAllCategories } from '@/store/slices/offer';
import { useExpandedKeys } from './context/expanded';

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

export const EntrieInput = ({ value }: Props) => {
	const dispatch = useAppDispatch();
	const allCategories = useAppSelector(selectAllCategories);
	const { addKey } = useExpandedKeys();

	const handleSelect = (offer: OfferData) => {
		dispatch(removeOfferRow(value.id));
		dispatch(addOfferRow(offer));
		const category = allCategories.find((cat) => cat.id === offer.categoryId);
		if (!category) return;
		const parentCategory = allCategories.find((cat) => cat.id === category.parentCategoryId);
		if (parentCategory) {
			addKey(`${parentCategory.id}-${category.id}`);
			addKey(`${parentCategory.id}`);
		} else {
			addKey(`${category.id}`);
		}
	};
	return (
		<LibraryDropdown
			value={value}
			onSelect={handleSelect}
			componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
				<Input
					placeholder={value}
					variant='borderless'
					value={value}
					onChange={handleChange}
					onBlur={handleBlur}
					onFocus={handleFocus}
				/>
			)}
		/>
	);
};
