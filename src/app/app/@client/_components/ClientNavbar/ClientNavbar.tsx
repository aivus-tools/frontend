'use client';

import { Button } from 'antd';
import { useRouter, usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { t } from '@/lib/i18n';
import { styled } from 'styled-components';
import React from 'react';

const Nav = styled.nav`
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  line-height: normal;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  color: var(--main);
  border-radius: 6px;
  white-space: nowrap;

  ${({ $isActive }) =>
    $isActive &&
    `
    color: var(--blue);
    background-color: var(--beige);
  `}
`;

const BRIEF_TABS = [
  { key: 'brief', label: 'Brief', suffix: '' },
  // { key: 'comparison', label: 'Comparison', suffix: '/comparison' },
];

export const ClientNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();

  const isBriefPage = segments[0] === 'brief' && segments.length >= 2 && segments[1] !== 'create-v2';
  const briefId = isBriefPage ? segments[1] : null;

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Nav>
        <Tab
          key='dashboard'
          $isActive={!isBriefPage && segments[0] === 'dashboard'}
          onClick={() => router.push('/app/dashboard')}
        >
          {t('DASHBOARD')}
        </Tab>
        {isBriefPage &&
          briefId &&
          BRIEF_TABS.map((tab) => {
            const tabPath = `/app/brief/${briefId}${tab.suffix}`;
            const isActive = tab.suffix === '' ? pathname === `/app/brief/${briefId}` : pathname.startsWith(tabPath);
            return (
              <Tab key={tab.key} $isActive={isActive} onClick={() => router.push(tabPath)}>
                {tab.label}
              </Tab>
            );
          })}
      </Nav>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button
          type='primary'
          style={{ background: '#FD8258', borderColor: '#FD8258' }}
          onClick={() => {
            router.push('/app/brief/create-v2');
          }}
        >
          {t('CREATE_A_BRIEF')}
        </Button>
      </div>
    </div>
  );
};
