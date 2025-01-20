'use client';
import styled from 'styled-components';

import { Form as LibForm } from 'antd';

export const Wrapper = styled.div`
	display: flex;
	gap: 30px;
	padding: 24px 30px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
`;

export const Column = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

export const Header = styled.div`
	color: var(--main);
	font-size: 14px;
	font-style: normal;
	font-weight: 700;
	line-height: normal;
	text-transform: uppercase;
	padding: 0px 6px 4px 6px;
`;

export const Content = styled.div`
	display: flex;
	padding: 30px;
	flex-direction: column;
	align-items: flex-start;
	align-self: stretch;
	border-radius: 6px;
	background-color: #fff;

	box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
`;

export const Form = styled(LibForm)`
	& .ant-form-item {
		width: 100%;
		margin-bottom: 20px;
	}
`;

export const IconButton = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;

	cursor: pointer;
`;

export const AntdListWrapper = styled.div`
	width: 100%;
	& .ant-form-item-control-input-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
`;
