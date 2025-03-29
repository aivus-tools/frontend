import { Input } from 'antd';
import { styled } from 'styled-components';
import { LibraryDropdown } from './LibraryDropdown/LibraryDropdown';
import { useSelectOffer } from './hooks/useSelectOffer';

const Wrapper = styled.div`
	padding: 0 20px 10px 30px;
	background-color: var(--bg-gray-page);
	display: flex;
	align-items: flex-end;

	& .ant-dropdown-trigger {
		flex: 1;
	}
`;

export const AddButton = () => {
	const handleSelect = useSelectOffer();

	return (
		<Wrapper>
			<ArrowIcon />
			<LibraryDropdown
				onSelect={handleSelect}
				componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
					<Input
						placeholder='Start typing here to add your first item...'
						variant='borderless'
						value={value}
						onChange={handleChange}
						onBlur={handleBlur}
						onFocus={handleFocus}
					/>
				)}
			/>
		</Wrapper>
	);
};

const ArrowIcon = () => (
	<svg width='31' height='34' viewBox='0 0 31 34' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M5.67946 0.456022C4.9354 13.07 14.6912 21.2899 25.8803 25.0148C26.0724 25.0791 26.177 25.2872 26.1126 25.4792C26.0483 25.6713 25.8402 25.7759 25.6482 25.7116C14.1454 21.8831 4.18143 13.3797 4.94655 0.412285C4.95806 0.210243 5.13194 0.0559871 5.33489 0.0676861C5.53693 0.079197 5.69116 0.253073 5.67946 0.456022Z'
			fill='#99A1B7'
		/>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M25.5542 25.2934C25.1213 24.8149 24.5714 24.2203 24.511 24.151C22.8732 22.2734 21.6144 20.2423 20.6089 17.9569C20.5271 17.7715 20.6118 17.5543 20.7972 17.4725C20.9825 17.3906 21.1997 17.4753 21.2816 17.6607C22.2559 19.8772 23.4761 21.8473 25.0651 23.6685C25.1576 23.7747 26.3946 25.1104 26.6245 25.3993C26.7193 25.5174 26.7363 25.6136 26.7381 25.6367C26.7526 25.759 26.7113 25.8441 26.6669 25.9031C26.6163 25.9693 26.5062 26.0582 26.3243 26.0773C26.1338 26.0966 25.7311 26.0398 25.6282 26.0337C24.0764 25.9454 22.3521 25.7118 20.7161 25.82C19.1559 25.9232 17.6742 26.3378 16.529 27.546C16.3897 27.6933 16.1566 27.699 16.0094 27.5597C15.8622 27.4204 15.8564 27.1874 15.9957 27.0401C17.2764 25.6896 18.9237 25.2022 20.6672 25.0869C22.2935 24.9794 24.0046 25.199 25.5542 25.2934Z'
			fill='#99A1B7'
		/>
	</svg>
);
