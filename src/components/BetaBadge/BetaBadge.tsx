'use client';

import React from 'react';
import { styled } from 'styled-components';

type BetaBadgeSize = 'sm' | 'md';

interface BetaBadgeProps {
  size?: BetaBadgeSize;
  className?: string;
}

const Badge = styled.span<{ $size: BetaBadgeSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
  background: linear-gradient(135deg, #fd8258 0%, #ff5c9c 50%, #7c3aed 100%);
  background-size: 200% 200%;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(253, 130, 88, 0.32);
  user-select: none;
  animation: beta-shimmer 6s ease-in-out infinite;

  font-size: ${(x) => (x.$size === 'sm' ? '9px' : '10px')};
  padding: ${(x) => (x.$size === 'sm' ? '2px 6px' : '3px 8px')};
  line-height: 1;

  @keyframes beta-shimmer {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

export const BetaBadge: React.FC<BetaBadgeProps> = (props) => {
  const size = props.size ?? 'md';
  return (
    <Badge $size={size} className={props.className}>
      Beta
    </Badge>
  );
};
