'use client';

import React from 'react';
import { styled } from 'styled-components';
import { t } from '@/lib/i18n';
import { ConversationStatus } from '@/types/briefAi.interface';

export type WorkspaceTab = 'chat' | 'docs' | 'comparison' | 'settings';

const Wrapper = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #eef0f4;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
`;

const TabButton = styled.button<{ $active: boolean; $disabled: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${(x) => (x.$active ? '#2288ff' : '#eef0f4')};
  background: ${(x) => (x.$active ? '#e8f0fe' : '#ffffff')};
  color: ${(x) => {
    if (x.$disabled) return '#d0d5dd';
    if (x.$active) return '#2288ff';
    return '#4b5675';
  }};
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: ${(x) => (x.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${(x) => (x.$active ? '#e8f0fe' : '#f5f7fa')};
    border-color: ${(x) => (x.$active ? '#2288ff' : '#d0d5dd')};
  }
`;

const StatusBadge = styled.span<{ $status: ConversationStatus }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${(x) => {
    if (x.$status === 'finalized') return '#d1fae5';
    if (x.$status === 'ready_to_finalize') return '#fef3c7';
    return '#e5e7eb';
  }};
  color: ${(x) => {
    if (x.$status === 'finalized') return '#047857';
    if (x.$status === 'ready_to_finalize') return '#b45309';
    return '#4b5675';
  }};
`;

const STATUS_LABELS: Record<ConversationStatus, () => string> = {
  in_progress: () => t('BRIEF_LIST_IN_PROGRESS'),
  ready_to_finalize: () => t('BRIEF_LIST_READY_TO_FINALIZE'),
  finalized: () => t('BRIEF_LIST_FINALIZED'),
};

interface BriefWorkspaceHeaderProps {
  activeTab: WorkspaceTab;
  conversationStatus: ConversationStatus;
  docsEnabled: boolean;
  comparisonEnabled?: boolean;
  settingsEnabled?: boolean;
  onSelectTab: (tab: WorkspaceTab) => void;
  rightSlot?: React.ReactNode;
}

export const BriefWorkspaceHeader: React.FC<BriefWorkspaceHeaderProps> = ({
  activeTab,
  conversationStatus,
  docsEnabled,
  comparisonEnabled,
  settingsEnabled,
  onSelectTab,
  rightSlot,
}) => {
  const compareEnabled = comparisonEnabled ?? docsEnabled;
  const settingsOn = settingsEnabled ?? true;
  return (
    <Wrapper>
      <Tabs>
        <TabButton $active={activeTab === 'chat'} $disabled={false} onClick={() => onSelectTab('chat')}>
          {t('BRIEF_V3_TAB_CHAT')}
        </TabButton>
        <TabButton
          $active={activeTab === 'docs'}
          $disabled={!docsEnabled}
          disabled={!docsEnabled}
          onClick={() => docsEnabled && onSelectTab('docs')}
          title={docsEnabled ? undefined : t('BRIEF_V3_DOCS_DISABLED_HINT')}
        >
          {t('BRIEF_V3_TAB_DOCS')}
        </TabButton>
        <TabButton
          $active={activeTab === 'comparison'}
          $disabled={!compareEnabled}
          disabled={!compareEnabled}
          onClick={() => compareEnabled && onSelectTab('comparison')}
          title={compareEnabled ? undefined : t('BRIEF_V3_DOCS_DISABLED_HINT')}
        >
          {t('BRIEF_V3_TAB_COMPARISON')}
        </TabButton>
        <TabButton
          $active={activeTab === 'settings'}
          $disabled={!settingsOn}
          disabled={!settingsOn}
          onClick={() => settingsOn && onSelectTab('settings')}
        >
          {t('BRIEF_V3_TAB_SETTINGS')}
        </TabButton>
      </Tabs>
      <StatusBadge $status={conversationStatus}>{STATUS_LABELS[conversationStatus]()}</StatusBadge>
      <div style={{ marginLeft: 'auto' }}>{rightSlot}</div>
    </Wrapper>
  );
};
