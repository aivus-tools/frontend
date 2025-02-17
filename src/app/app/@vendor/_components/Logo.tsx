'use client';
import Link from 'next/link';
import HomeIcon from '@/icons/home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import { styled } from 'styled-components';
import { Theme } from '@/types';
import { THEME } from '@/lib/constants';

const IconWrapper = styled.div<{ themeType: Theme }>`
	display: flex;
	align-items: center;
	justify-content: start;
	height: 70px;
	color: ${({ themeType }) => (themeType === THEME.light ? 'var(--main-dark)' : '#fff')};
`;

const IconGroup = styled.div`
	display: flex;
	align-items: center;
	padding: 30px;
	gap: 12px;
`;

export const Logo = ({ theme }: { theme: Theme }) => {
	return (
		<Link href='/app/dashboard' prefetch={false}>
			<IconWrapper themeType={theme}>
				<IconGroup>
					<HomeIcon />
					<LogoIcon />
				</IconGroup>
			</IconWrapper>
		</Link>
	);
};
