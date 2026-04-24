'use client';

import React from 'react';
import Link from 'next/link';
import { styled } from 'styled-components';
import HomeIcon from '@/icons/home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import { BetaBadge } from '@/components/BetaBadge/BetaBadge';
import { AppRoute } from '@/constants/appRoute';
import { Theme } from '@/types/index.interface';
import { THEME } from '@/constants/constants';

interface ClientHomeLogoProps {
  theme?: Theme;
  compact?: boolean;
}

const Wrapper = styled.div<{ $theme: Theme; $compact: boolean }>`
  display: flex;
  align-items: center;
  justify-content: start;
  height: ${(x) => (x.$compact ? '40px' : '70px')};
  color: ${(x) => (x.$theme === THEME.light ? 'var(--main-dark)' : '#fff')};
`;

const Group = styled.div<{ $compact: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(x) => (x.$compact ? '0' : '30px')};
  gap: 12px;
`;

export const ClientHomeLogo: React.FC<ClientHomeLogoProps> = (props) => {
  const theme = props.theme ?? THEME.light;
  const compact = !!props.compact;
  return (
    <Link href={AppRoute.DASHBOARD} prefetch={false}>
      <Wrapper $theme={theme} $compact={compact}>
        <Group $compact={compact}>
          <HomeIcon />
          <LogoIcon />
          <BetaBadge size='sm' />
        </Group>
      </Wrapper>
    </Link>
  );
};
