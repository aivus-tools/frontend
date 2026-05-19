'use client';

import React from 'react';
import Link from 'next/link';
import HomeIcon from '@/icons/home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import { BetaBadge } from '@/components/BetaBadge/BetaBadge';
import { AppRoute } from '@/constants/appRoute';
import { Theme } from '@/types/index.interface';
import { THEME } from '@/constants/constants';

import styles from './ClientHomeLogo.module.css';

interface ClientHomeLogoProps {
  theme?: Theme;
  compact?: boolean;
}

export const ClientHomeLogo = (props: ClientHomeLogoProps) => {
  const theme = props.theme ?? THEME.light;
  const compact = !!props.compact;
  const wrapperClass = [
    styles.wrapper,
    theme === THEME.light ? null : styles.wrapperDark,
    compact ? styles.wrapperCompact : null,
  ]
    .filter(Boolean)
    .join(' ');
  const groupClass = [styles.group, compact ? styles.groupCompact : null].filter(Boolean).join(' ');

  return (
    <Link href={AppRoute.DASHBOARD} prefetch={false}>
      <div className={wrapperClass}>
        <div className={groupClass}>
          <span className={styles.homeIcon}>
            <HomeIcon />
          </span>
          <LogoIcon />
          <span className={styles.betaSlot}>
            <BetaBadge size='sm' />
          </span>
        </div>
      </div>
    </Link>
  );
};
