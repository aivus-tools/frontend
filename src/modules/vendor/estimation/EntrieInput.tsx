'use client';

import { Input as LibInput } from 'antd';
import { styled } from 'styled-components';
import { OfferData } from './types';
import { LibraryDropdown } from './LibraryDropdown/LibraryDropdown';

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
	return (
		<LibraryDropdown
			value={value}
			componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
				<Input
					placeholder='Borderless'
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
