import { Input, Space } from 'antd';
import { styled } from 'styled-components';
import { LibraryDropdown } from './LibraryDropdown/LibraryDropdown';
import { SearchOutlined } from '@ant-design/icons';
import { OfferData } from './types';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addOfferRow, selectAllCategories } from '@/store/slices/offer';
import { useExpandedKeys } from './context/expanded';

const Wrapper = styled.div`
	padding: 12px;
	margin: 10px 30px;

	// position: sticky;
	// top: 0;
	background-color: var(--bg-gray-page);

	display: flex;
	justify-content: center;
	align-items: center;
`;

export const AddButton = () => {
	const dispatch = useAppDispatch();
	const allCategories = useAppSelector(selectAllCategories);
	const { addKey } = useExpandedKeys();

	const handleSelect = (offer: OfferData) => {
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
		<Wrapper>
			<LibraryDropdown
				onSelect={handleSelect}
				componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
					<Space.Compact style={{ width: '340px' }} onBlur={handleBlur} onFocus={handleFocus}>
						<Input addonBefore={<SearchOutlined />} value={value} onChange={handleChange} />
					</Space.Compact>
				)}
			/>
		</Wrapper>
	);
};
