import { styled } from 'styled-components';

export const SectionTitle = styled.div<{ isOpen?: boolean }>`
	display: flex;
	align-items: center;
	background-color: var(--white);
	border-radius: ${({ isOpen }) => (isOpen ? '6px 0 0 0' : '6px 0 0 6px')};
	padding: 18px 2px;
`;

export const SectionTitleText = styled.div`
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
	color: var(--blue);
	user-select: none;
`;

export const SectionTitleSumHeader = styled.div`
	font-weight: 600;
	font-size: 16px;
	line-height: 19.5px;
	text-align: right;
	background-color: var(--white);
	display: flex;
	align-items: center;

	color: var(--blue);
`;

export const SectionSubTitleSumHeader = styled.div`
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
	text-align: right;
	background-color: var(--white);
	display: flex;
	align-items: center;
`;

export const SectionTitlePercentHeader = styled.div`
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
	background-color: var(--white);
	display: flex;
	align-items: center;

	color: var(--blue);
`;

export const SectionSubTitle = styled.div`
	display: flex;
	align-items: center;
	padding: 8px 0px;
	background-color: var(--white);
`;

export const SectionSubTitleText = styled.div`
	font-weight: 500;
	font-size: 13px;
	line-height: 15.85px;
	color: var(--blue);
	user-select: none;
`;
