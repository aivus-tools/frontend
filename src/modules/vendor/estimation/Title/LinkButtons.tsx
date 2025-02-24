'use client';

import { styled } from 'styled-components';
import LinkIcon from '@/icons/link.svg';
import UnLinkIcon from '@/icons/unlink.svg';

const ButtonWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	cursor: pointer;

	color: var(--blue);
`;

interface LinkButtonProps {
	link: boolean;
	onClickAction: () => void;
}

export const LinkButton = ({ link, onClickAction }: LinkButtonProps) => {
	return <ButtonWrapper onClick={onClickAction}>{link ? <LinkIcon /> : <UnLinkIcon />}</ButtonWrapper>;
};
