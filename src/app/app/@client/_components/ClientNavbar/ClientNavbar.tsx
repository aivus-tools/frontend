'use client';

import { Button } from 'antd';
import { useRouter, usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { t } from '@/lib/i18n';
import { styled } from 'styled-components';
import React from 'react';

interface ClientNavbarProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

const Wrapper = styled.div<{ $variant: 'desktop' | 'mobile' }>`
  flex: 1;
  display: flex;
  align-items: center;
  ${(x) =>
    x.$variant === 'desktop'
      ? `
    flex-direction: row;
    justify-content: space-between;
  `
      : `
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    width: 100%;
  `}
`;

const Nav = styled.nav<{ $variant: 'desktop' | 'mobile' }>`
  display: flex;
  gap: 8px;
  ${(x) =>
    x.$variant === 'mobile' &&
    `
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    width: 100%;
  `}
`;

const Tab = styled.button<{ $isActive: boolean; $variant: 'desktop' | 'mobile' }>`
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
  ${(x) => x.$variant === 'mobile' && 'padding: 12px 14px; font-size: 15px;'}

  ${(x) =>
    x.$isActive &&
    `
    color: var(--blue);
    background-color: var(--beige);
  `}
`;

const Actions = styled.div<{ $variant: 'desktop' | 'mobile' }>`
  display: flex;
  gap: 12px;
  align-items: center;
  ${(x) =>
    x.$variant === 'mobile' &&
    `
    width: 100%;
    & > .ant-btn {
      width: 100%;
    }
  `}
`;

const BRIEF_TABS = [{ key: 'brief', label: 'Brief', suffix: '' }];

export const ClientNavbar: React.FC<ClientNavbarProps> = (props) => {
  const variant = props.variant ?? 'desktop';
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();

  const isBriefPage = segments[0] === 'brief' && segments.length >= 2 && segments[1] !== 'create-v2';
  const briefId = isBriefPage ? segments[1] : null;

  const navigate = (path: string) => {
    router.push(path);
    props.onNavigate?.();
  };

  return (
    <Wrapper $variant={variant}>
      <Nav $variant={variant}>
        <Tab
          key='dashboard'
          $variant={variant}
          $isActive={!isBriefPage && segments[0] === 'dashboard'}
          onClick={() => navigate('/app/dashboard')}
        >
          {t('DASHBOARD')}
        </Tab>
        {isBriefPage &&
          briefId &&
          BRIEF_TABS.map((tab) => {
            const tabPath = `/app/brief/${briefId}${tab.suffix}`;
            const isActive = tab.suffix === '' ? pathname === `/app/brief/${briefId}` : pathname.startsWith(tabPath);
            return (
              <Tab key={tab.key} $variant={variant} $isActive={isActive} onClick={() => navigate(tabPath)}>
                {tab.label}
              </Tab>
            );
          })}
      </Nav>
      <Actions $variant={variant}>
        <Button
          type='primary'
          style={{ background: '#FD8258', borderColor: '#FD8258' }}
          onClick={() => {
            navigate('/app/brief/create-v2');
          }}
        >
          {t('CREATE_A_BRIEF')}
        </Button>
      </Actions>
    </Wrapper>
  );
};
