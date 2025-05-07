'use client';

import { styled } from 'styled-components';
import SettingsIcon from '@/icons/settings-icon.svg';
import { Flex } from 'antd';
import { useAppSelector } from '@/lib/hooks';
import { selectGrandTotal } from '@/store/slices/offer/selectors';

const Label = styled.div`
	display: flex;
	justify-content: space-between;
	background-color: var(--bg-blue-important);
	padding: 16px 0;
	padding-right: 40px;
	gap: 8px;

	font-weight: 700;
	font-size: 14px;
	text-transform: uppercase;
`;
const TotalSum = styled.div`
	min-width: 90px;
	display: flex;
	align-items: center;
	justify-content: flex-end;

	font-weight: 700;
	font-size: 18px;
`;

const EmptyBlockTotalSum = styled.div`
	background-color: var(--bg-blue-important);
`;

export const GrandTotal = () => {
	const { total, clientTotal } = useAppSelector(selectGrandTotal);
	return (
		<>
			<EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }}>
				<Flex align='center' justify='center' style={{ height: '100%' }}>
					<SettingsIcon />
				</Flex>
			</EmptyBlockTotalSum>
			<Label style={{ gridColumn: 'span 6' }}>
				<Flex align='center' justify='end'>
					Grand total
				</Flex>
				<TotalSum>{`$ ${total}`}</TotalSum>
			</Label>
			<div />
			<Flex
				justify='flex-end'
				style={{ gridColumn: 'span 5', paddingRight: '16px', backgroundColor: 'var(--bg-blue-important)' }}
			>
				<TotalSum>{`$ ${clientTotal}`}</TotalSum>
			</Flex>
		</>
	);
};
