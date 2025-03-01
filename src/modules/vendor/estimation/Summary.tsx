'use client';

import { styled } from 'styled-components';
import SettingsIcon from '@/icons/settings-icon.svg';
import { Flex } from 'antd';

const Label = styled.div`
	text-align: left;
	padding: 16px 0;
	background-color: var(--bg-green);
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
`;
const TotalSum = styled.div`
	font-weight: 600;
	font-size: 16px;
	line-height: 19.5px;
	color: var(--green-darker);
	padding: 16px 0;
	background-color: var(--bg-green);
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

const EmptyBlockTotalSum = styled.div`
	background-color: var(--bg-green);
`;

export const Summary = () => (
	<>
		<EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }}>
			<Flex align='center' justify='center' style={{ height: '100%' }}>
				<SettingsIcon />
			</Flex>
		</EmptyBlockTotalSum>
		<Label style={{ gridColumn: 'span 4' }}>Subtotal for All Sections</Label>
		<TotalSum>$ 19,740.0</TotalSum>
		<EmptyBlockTotalSum style={{ borderRadius: '0 6px 6px 0' }} />
		<div />
		<EmptyBlockTotalSum style={{ gridColumn: 'span 5', borderRadius: '6px' }} />
	</>
);
