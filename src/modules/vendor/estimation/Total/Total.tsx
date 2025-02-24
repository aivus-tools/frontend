'use client';

import { styled } from 'styled-components';

const Label = styled.div`
	font-weight: 600;
	font-size: 14px;
	line-height: 17.07px;
	letter-spacing: 0%;
	text-align: right;
	font-style: uppercase;
	background-color: var(--white);
	padding: 16px 0;
	background-color: var(--bg-blue-important);
	border-radius: 0 0 0 6px;
	text-transform: uppercase;
`;
const TotalSum = styled.div`
	font-weight: 600;
	font-size: 16px;
	line-height: 19.5px;
	text-align: right;
	color: var(--blue);
	padding: 16px 0;
	background-color: var(--bg-blue-important);
`;

const EmptyBlockTotalSum = styled.div`
	background-color: var(--bg-blue-important);
	border-radius: 0 0 6px 6px;
`;

export const Total = ({ text, value }: { text: string; value: string }) => (
	<>
		<Label style={{ gridColumn: 'span 5' }}>{text} TOTAL:</Label>
		<TotalSum>{value}</TotalSum>
		<EmptyBlockTotalSum style={{ borderRadius: ' 0 0 6px 0' }} />
		<div />
		<EmptyBlockTotalSum style={{ gridColumn: 'span 5' }} />
	</>
);
