'use client';

import { styled } from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	justify-content: flex-end;
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

export const Total = ({ text, value }: { text: string; value: string }) => (
	<>
		<Wrapper style={{ gridColumn: 'span 7' }}>
			<Label>{text} TOTAL:</Label>
			<TotalSum>{value}</TotalSum>
		</Wrapper>
		<div />
		<EmptyBlockTotalSum style={{ gridColumn: 'span 5' }} />
	</>
);
