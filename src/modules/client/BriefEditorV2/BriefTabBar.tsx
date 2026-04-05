'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { styled } from 'styled-components';

interface BriefTabBarProps {
  briefId: string;
}

const TabBarWrapper = styled.div`
  display: flex;
  gap: 0;
  background: #ffffff;
  border-bottom: 1px solid #eef0f4;
  padding: 0 20px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: ${(x) => (x.$active ? 600 : 500)};
  color: ${(x) => (x.$active ? '#2288ff' : '#99a1b7')};
  background: none;
  border: none;
  border-bottom: 2px solid ${(x) => (x.$active ? '#2288ff' : 'transparent')};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${(x) => (x.$active ? '#2288ff' : '#4b5675')};
  }
`;

const TABS = [
  { key: 'brief', label: 'Brief', suffix: '' },
  { key: 'comparison', label: 'Comparison', suffix: '/comparison' },
  { key: 'offers', label: 'Vendor Offers', suffix: '/offers' },
];

export const BriefTabBar: React.FC<BriefTabBarProps> = (props) => {
  const pathname = usePathname();
  const router = useRouter();

  const basePath = `/app/brief/${props.briefId}`;

  return (
    <TabBarWrapper>
      {TABS.map((tab) => {
        const tabPath = `${basePath}${tab.suffix}`;
        const isActive = tab.suffix === '' ? pathname === basePath : pathname.startsWith(tabPath);
        return (
          <Tab key={tab.key} $active={isActive} onClick={() => router.push(tabPath)}>
            {tab.label}
          </Tab>
        );
      })}
    </TabBarWrapper>
  );
};
