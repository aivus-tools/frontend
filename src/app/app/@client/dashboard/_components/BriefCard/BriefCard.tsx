'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Dropdown, Input, Modal } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { PrStatus } from '@/components/PrStatus/PrStatus';
import { t } from '@/lib/i18n';
import { PROJECT_STATUS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { ProjectStatus } from '@/types/project.interface';
import { useDeleteBriefAiMutation, useRenameBriefAiMutation } from '@/services/client/briefAiApi';
import { BriefV3ListItem, ConversationStatus } from '@/types/briefAi.interface';

import styles from './BriefCard.module.css';

interface BriefCardProps {
  brief: BriefV3ListItem;
}

const getAccentColor = (status?: string): string => {
  switch (status) {
    case PROJECT_STATUS.RFP:
      return '#2288FF';
    case PROJECT_STATUS.REVIEWING:
      return '#FD8258';
    case PROJECT_STATUS.ONGOING:
      return '#A5C500';
    case PROJECT_STATUS.COMPLETED:
      return '#A5C500';
    default:
      return '#99A1B7';
  }
};

const getRowBg = (status?: string): string => {
  switch (status) {
    case PROJECT_STATUS.RFP:
      return '#F4FBFF';
    case PROJECT_STATUS.ONGOING:
    case PROJECT_STATUS.COMPLETED:
      return '#FCFFF0';
    default:
      return '#FFFFFF';
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
    return <span style={{ color: '#99A1B7', fontSize: 12 }}>—</span>;
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

export const BriefCard: React.FC<BriefCardProps> = ({ brief }) => {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [deleteBrief, { isLoading: isDeleting }] = useDeleteBriefAiMutation();
  const [renameBrief, { isLoading: isRenaming }] = useRenameBriefAiMutation();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const title = brief.title || t('UNTITLED_BRIEF');
  const formattedCreated = brief.createdAt ? format(new Date(brief.createdAt), 'MMM dd, yyyy') : '';

  const handleClick = () => {
    router.push(AppRoute.BRIEF_V2_DETAIL(brief.id));
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
    <div className={styles.card} style={{ backgroundColor: getRowBg(brief.status) }} onClick={handleClick}>
      <div className={styles.row}>
        <div className={styles.projectCell}>
          <div className={styles.accent} style={{ backgroundColor: getAccentColor(brief.status) }} />
          <div>
            <div className={styles.projectName}>{title.toUpperCase()}</div>
            <div className={styles.assignee}>{renderConversationLabel(brief.conversationStatus)}</div>
          </div>
        </div>

        <div className={styles.statusCell}>
          <PrStatus status={brief.status as ProjectStatus} />
        </div>

        <div className={styles.messagesCell}>
          <span className={styles.numericValue}>{brief.messageCount}</span>
        </div>

        <div className={styles.offersCell}>{renderOffersCell(brief, handleCompareClick)}</div>

        <div className={styles.dateCell}>
          <div className={styles.dateValue}>{formattedCreated}</div>
        </div>

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
