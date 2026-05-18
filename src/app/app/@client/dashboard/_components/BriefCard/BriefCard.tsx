'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Dropdown, Input, Modal, theme } from 'antd';
import { CalendarOutlined, MessageOutlined, MoreOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { format, formatDistanceToNow } from 'date-fns';
import { PrStatus } from '@/components/PrStatus/PrStatus';
import { t } from '@/lib/i18n';
import { PROJECT_STATUS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { ProjectStatus } from '@/types/project.interface';
import { useDeleteBriefAiMutation, useRenameBriefAiMutation } from '@/services/client/briefAiApi';
import { BriefV3ListItem, ConversationStatus } from '@/types/briefAi.interface';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import styles from './BriefCard.module.css';

interface BriefCardProps {
  brief: BriefV3ListItem;
}

interface StatusPalette {
  accent: string;
  background: string;
}

const useStatusPalette = (status?: string): StatusPalette => {
  const { token } = theme.useToken();
  switch (status) {
    case PROJECT_STATUS.RFP:
      return { accent: token.colorPrimary, background: 'var(--bg-blue-subtotal)' };
    case PROJECT_STATUS.REVIEWING:
      return { accent: token.colorWarning, background: token.colorBgContainer };
    case PROJECT_STATUS.ONGOING:
    case PROJECT_STATUS.COMPLETED:
      return { accent: token.colorSuccess, background: 'var(--bg-light-green)' };
    default:
      return { accent: token.colorTextSecondary, background: token.colorBgContainer };
  }
};

const renderConversationLabel = (status: ConversationStatus): string => {
  if (status === 'finalized') {
    return t('BRIEF_LIST_FINALIZED');
  }
  if (status === 'ready_to_finalize') {
    return t('BRIEF_LIST_READY_TO_FINALIZE');
  }
  return t('BRIEF_LIST_IN_PROGRESS');
};

const renderOffersCell = (
  brief: BriefV3ListItem,
  onCompareClick: (event: React.MouseEvent) => void
): React.ReactNode => {
  if (brief.offersCount === 0) {
    return <span className={styles.emptyMark}>—</span>;
  }
  if (brief.offersCount === 1) {
    return <span className={styles.numericValue}>1 {t('BRIEF_LIST_OFFER_RECEIVED')}</span>;
  }
  return (
    <Button size='small' type='primary' className={styles.compareButton} onClick={onCompareClick}>
      {t('BRIEF_LIST_COMPARE_N_OFFERS', String(brief.offersCount))}
    </Button>
  );
};

export const BriefCard = (props: BriefCardProps) => {
  const { brief } = props;
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [deleteBrief, { isLoading: isDeleting }] = useDeleteBriefAiMutation();
  const [renameBrief, { isLoading: isRenaming }] = useRenameBriefAiMutation();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const palette = useStatusPalette(brief.status);
  const title = brief.title || t('UNTITLED_BRIEF');
  const formattedCreated = brief.createdAt ? format(new Date(brief.createdAt), 'MMM dd, yyyy') : '';
  const relativeCreated = brief.createdAt ? formatDistanceToNow(new Date(brief.createdAt), { addSuffix: true }) : '';
  const { isMobile } = useBreakpoint();

  const handleClick = () => {
    router.push(AppRoute.BRIEF_DETAIL(brief.id));
  };

  const handleCompareClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(AppRoute.BRIEF_COMPARISON(brief.id));
  };

  const handleRenameOpen = () => {
    setRenameValue(title);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      return;
    }
    try {
      await renameBrief({ briefId: brief.id, title: trimmed }).unwrap();
      message.success(t('BRIEF_RENAME_SUCCESS'));
      setRenameModalOpen(false);
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleDelete = () => {
    modal.confirm({
      title: t('BRIEF_DELETE_CONFIRM_TITLE'),
      content: t('BRIEF_DELETE_CONFIRM'),
      okText: t('BRIEF_DELETE'),
      okType: 'danger',
      cancelText: t('CANCEL'),
      width: 'min(520px, calc(100vw - 24px))',
      centered: true,
      onOk: async () => {
        try {
          await deleteBrief(brief.id).unwrap();
          message.success(t('BRIEF_DELETE_SUCCESS'));
        } catch {
          message.error(t('UNEXPECTED_ERROR'));
        }
      },
    });
  };

  const stopPropagation = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
  };

  const menuItems = [
    {
      key: 'rename',
      label: t('BRIEF_RENAME'),
      onClick: handleRenameOpen,
    },
    {
      key: 'delete',
      label: t('BRIEF_DELETE'),
      danger: true,
      disabled: isDeleting,
      onClick: handleDelete,
    },
  ];

  return (
    <div
      className={styles.card}
      style={{ '--card-bg': palette.background } as React.CSSProperties}
      onClick={handleClick}
    >
      <div className={styles.row}>
        <div className={styles.projectCell}>
          <div className={styles.accent} style={{ backgroundColor: palette.accent }} />
          <div>
            <div className={styles.projectName}>{title.toUpperCase()}</div>
            <div className={styles.assignee}>{renderConversationLabel(brief.conversationStatus)}</div>
          </div>
        </div>

        <div className={styles.statusCell} data-label={t('DASHBOARD_STATUS')}>
          <PrStatus status={brief.status as ProjectStatus} />
        </div>

        <div className={styles.messagesCell} data-label={t('BRIEF_LIST_MESSAGES')}>
          <span className={styles.numericValue}>{brief.messageCount}</span>
        </div>

        <div className={styles.offersCell} data-label={t('BRIEF_LIST_OFFERS')}>
          {renderOffersCell(brief, handleCompareClick)}
        </div>

        <div className={styles.dateCell} data-label={t('CREATED')}>
          <div className={styles.dateValue}>{formattedCreated}</div>
        </div>

        {isMobile ? (
          <div className={styles.metaRow}>
            {relativeCreated ? (
              <span className={styles.metaItem}>
                <CalendarOutlined />
                {t('BRIEF_LIST_SENT_AGO', relativeCreated)}
              </span>
            ) : null}
            <span className={styles.metaDivider} aria-hidden='true'>
              ·
            </span>
            <span className={styles.metaItem}>
              <MessageOutlined />
              {t('BRIEF_LIST_MSGS', String(brief.messageCount))}
            </span>
            <span className={styles.metaDivider} aria-hidden='true'>
              ·
            </span>
            <span className={styles.metaItem}>
              <ShoppingCartOutlined />
              {t('BRIEF_LIST_OFFERS_COUNT', String(brief.offersCount))}
            </span>
          </div>
        ) : null}

        <div className={styles.actionsCell} onClick={stopPropagation} role='presentation'>
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement='bottomRight'>
            <Button type='text' icon={<MoreOutlined />} loading={isRenaming} />
          </Dropdown>
        </div>
      </div>

      <Modal
        title={t('BRIEF_RENAME')}
        open={renameModalOpen}
        onCancel={() => setRenameModalOpen(false)}
        onOk={handleRenameSubmit}
        okText={t('SAVE')}
        cancelText={t('CANCEL')}
        confirmLoading={isRenaming}
        okButtonProps={{ disabled: !renameValue.trim() }}
        destroyOnClose
        width='min(520px, calc(100vw - 24px))'
        centered
      >
        <Input
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          onPressEnter={handleRenameSubmit}
          placeholder={t('BRIEF_RENAME_PLACEHOLDER')}
          maxLength={255}
          onClick={stopPropagation}
        />
      </Modal>
    </div>
  );
};
