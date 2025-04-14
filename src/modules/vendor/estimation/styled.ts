'use client';

import { Flex, InputNumber } from 'antd';
import { styled } from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;

	padding: 10px 30px 30px 30px;
`;
export const Table = styled.div`
	display: grid;
	grid-template-columns: 38px 1fr 90px 160px 50px 90px 40px 50px 30px 65px 80px 75px 0px;
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

export const EstimationItem = styled.div<{ $hovered?: boolean }>`
	padding: 8px 0;
	text-align: center;
	background-color: ${({ $hovered }) => ($hovered ? 'var(--bg-blue-subsection)' : 'var(--white)')};

	font-weight: 500;
	font-size: 13px;
	line-height: 15.85px;
	padding: 4px 2px;

	position: relative;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const DropdownButton = styled.div`
	cursor: pointer;
`;

export const SelectWrapper = styled(Flex)<{ $hovered?: boolean }>`
	gap: 5px;
	width: 100%;

	span.ant-select-arrow {
		${({ $hovered }) => ($hovered ? '' : 'color: transparent;')};
	}
`;

export const IconButton = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;

	cursor: pointer;
`;

export const InputNumberRight = styled(InputNumber)`
	.ant-input-number-input-wrap input.ant-input-number-input {
		text-align: right;
		padding: 4px;
	}
` as typeof InputNumber;
