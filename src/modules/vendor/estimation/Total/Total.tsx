'use client';

import { Flex, Input } from 'antd';
import { styled } from 'styled-components';
import AddIcon from '@/icons/add-icon.svg';
import { useSelectOffer } from '../hooks/useSelectOffer';
import { LibraryDropdown } from '../LibraryDropdown/LibraryDropdown';

const Wrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: var(--bg-blue-important);
	padding-right: 40px;
	gap: 8px;
`;

const Label = styled.div`
	font-weight: 600;
	font-size: 14px;
	line-height: 17.07px;
	letter-spacing: 0%;
	text-align: right;
	font-style: uppercase;
	padding: 16px 0;
	border-radius: 0 0 0 6px;
	text-transform: uppercase;
`;
const TotalSum = styled.div`
	font-weight: 600;
	font-size: 16px;
	line-height: 19.5px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	color: var(--blue);
	padding: 16px 0;
	min-width: 90px;
`;

const EmptyBlockTotalSum = styled.div`
	background-color: var(--bg-blue-important);
	border-radius: 0 0 6px 6px;
`;

export const Total = ({ text, value }: { text: string; value: string }) => {
	const handleSelect = useSelectOffer();

	return (
		<>
			<Flex
				align='center'
				justify='center'
				style={{ backgroundColor: 'var(--bg-blue-important)', borderRadius: '0 0 0 6px' }}
			>
				<AddIcon />
			</Flex>
			<Wrapper style={{ gridColumn: 'span 6' }}>
				<Flex>
					<LibraryDropdown
						onSelect={handleSelect}
						componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
							<Input
								placeholder='add item'
								variant='borderless'
								value={value}
								onChange={handleChange}
								onBlur={handleBlur}
								onFocus={handleFocus}
							/>
						)}
					/>
				</Flex>
				<Flex>
					<Label>{text} TOTAL:</Label>
					<TotalSum>{value}</TotalSum>
				</Flex>
			</Wrapper>
			<div />
			<EmptyBlockTotalSum style={{ gridColumn: 'span 5' }} />
		</>
	);
};
