'use client';

import { Input as LibInput } from 'antd';
import { useState } from 'react';
import { styled } from 'styled-components';

const Input = styled(LibInput)`
	&.ant-input-borderless {
		border: 1px solid transparent;
	}

	&.ant-input-borderless:focus {
		border: 1px solid var(--blue);
	}
`;

interface Props {
	value: string;
}

export const EntrieInput = ({ value: initialValue }: Props) => {
	const [value, setValue] = useState(initialValue);

	return (
		<Input
			placeholder='Borderless'
			variant='borderless'
			value={value}
			onChange={(e) => setValue(e.currentTarget.value)}
		/>
	);
};
