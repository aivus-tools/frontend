'use client';

import { Button, Tooltip } from 'antd';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
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

const CLIENT_TABS = [
  { key: 'dashboard', label: t('DASHBOARD') },
];

export const ClientNavbar = () => {
  const router = useRouter();
  const tab = useSelectedLayoutSegment();

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Nav>
        {CLIENT_TABS.map((item) => (
          <Tab
            key={item.key}
            $isActive={tab === item.key}
            onClick={() => router.push(`/app/${item.key}`)}
          >
            {item.label}
          </Tab>
        ))}
      </Nav>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button
          type="primary"
          style={{ background: '#FD8258', borderColor: '#FD8258' }}
          onClick={() => {
            router.push('/app/brief/create');
          }}
        >
          {t('CREATE_A_BRIEF')}
        </Button>
        <Tooltip title={t('COMING_SOON')}>
          <Button type="primary" disabled>
            {t('CREATE_A_CALCULATION')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
