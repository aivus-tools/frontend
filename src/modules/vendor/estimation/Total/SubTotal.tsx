'use client';

import { styled } from 'styled-components';

const LabelSubTotal = styled.div`
	font-weight: 600;
	font-size: 13px;
	line-height: 15.85px;
	text-align: right;
	background-color: var(--white);
	padding: 12px 0;
	background-color: var(--bg-blue-subtotal);
	border-radius: 0 0 0 6px;
`;
const SubTotalSum = styled.div`
	padding: 12px 0;
	background-color: var(--white);
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
	border-radius: 0 0 6px 6px;
	text-align: right;
	color: var(--blue);
	background-color: var(--bg-blue-subtotal);
`;

const EmptyBlockSubTotalSum = styled.div`
	background-color: var(--bg-blue-subtotal);
	border-radius: 0 0 6px 6px;
`;

export const SubTotal = ({ value }: { value: string }) => (
	<>
		<LabelSubTotal style={{ gridColumn: 'span 5' }}>Subtotal of Locations:</LabelSubTotal>
		<SubTotalSum>{value}</SubTotalSum>
		<EmptyBlockSubTotalSum style={{ borderRadius: ' 0 0 6px 0' }} />
		<div />
		<EmptyBlockSubTotalSum style={{ gridColumn: 'span 5' }} />
	</>
);
