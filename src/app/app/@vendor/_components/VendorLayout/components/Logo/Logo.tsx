'use client';
import Link from 'next/link';
import HomeIcon from '@/icons/home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import { Theme } from '@/types/index.interface';
import { THEME } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { BetaBadge } from '@/components/BetaBadge/BetaBadge';

import styles from './Logo.module.css';

interface LogoProps {
  theme?: Theme;
}

export const Logo = (props: LogoProps) => {
  const themeClass = props.theme === THEME.light ? styles.wrapperLight : styles.wrapperDark;

  return (
    <Link href={AppRoute.DASHBOARD} prefetch={false}>
      <div className={`${styles.wrapper} ${themeClass}`}>
        <div className={styles.group}>
          <HomeIcon />
          <LogoIcon />
          <BetaBadge size='sm' />
        </div>
      </div>
    </Link>
  );
};
