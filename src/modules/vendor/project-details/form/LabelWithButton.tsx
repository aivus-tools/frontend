import React, { PropsWithChildren } from 'react';
import { Typography } from 'antd';
import { styled } from 'styled-components';

const LabelContainer = styled.div`
	display: flex;
	width: 100%;
	gap: 10px;
	align-items: center;
	justify-content: space-between;
`;

const Side = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;

	cursor: pointer;
`;

interface Props {
	text: string;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const LabelWithSide = ({ text, children, onClick }: PropsWithChildren<Props>) => {
	return (
		<LabelContainer onClick={onClick}>
			<Typography.Text>{text}</Typography.Text>
			<Side>{children}</Side>
		</LabelContainer>
	);
};
