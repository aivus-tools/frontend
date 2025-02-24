'use client';

import { styled } from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;

	padding: 10px 30px;
`;
export const Table = styled.div`
	display: grid;
	grid-template-columns: 38px 1fr 90px 160px 50px 90px 40px 50px 30px 90px 80px 75px 80px;
	grid-template-rows: auto auto;
	grid-auto-flow: row;

	& > .estimation-header {
		font-weight: 500;
		color: var(--gray);

		font-size: 10px;
		line-height: 12.19px;
		padding: 8px 0;
		text-align: center;
	}
`;

export const Line = styled.div`
	display: flex;
	border-bottom: 0.5px dashed var(--gray);
`;

export const EstimationItem = styled.div<{ hovered?: boolean }>`
	padding: 8px 0;
	text-align: center;
	background-color: ${({ hovered }) => (hovered ? 'var(--bg-blue-subsection)' : 'var(--white)')};

	font-weight: 500;
	font-size: 13px;
	line-height: 15.85px;

	position: relative;
`;

export const DropdownButton = styled.div`
	cursor: pointer;
`;
