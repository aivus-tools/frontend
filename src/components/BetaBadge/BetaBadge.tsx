'use client';

import React from 'react';

import styles from './BetaBadge.module.css';

type BetaBadgeSize = 'sm' | 'md';

interface BetaBadgeProps {
  size?: BetaBadgeSize;
  className?: string;
}

export const BetaBadge = (props: BetaBadgeProps) => {
  const size = props.size ?? 'md';
  const sizeClassName = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const className = [styles.badge, sizeClassName, props.className].filter(Boolean).join(' ');
  return <span className={className}>Beta</span>;
};
