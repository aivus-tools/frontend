'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Dropdown, Input, Modal, Tooltip } from 'antd';
import { MoreOutlined, EyeOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { PrStatus } from '@/components/PrStatus/PrStatus';
import { t } from '@/lib/i18n';
import { PROJECT_STATUS } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { ProjectStatus } from '@/types/project.interface';
import {
  useDeleteBriefAiMutation,
  useDuplicateBriefAiMutation,
  useRenameBriefAiMutation,
} from '@/services/client/briefAiApi';
import { BriefV2ListItem } from '@/types/briefV2.interface';

import styles from './BriefCard.module.css';

interface BriefCardProps {
  brief: BriefV2ListItem;
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

const renderShareBadge = (brief: BriefV2ListItem): React.ReactNode => {
  if (brief.shareStatus === 'none') {
    return <span style={{ color: '#99A1B7', fontSize: 12 }}>{t('BRIEF_LIST_NOT_SHARED')}</span>;
  }
  if (brief.shareStatus === 'inactive') {
    return <span style={{ color: '#99A1B7', fontSize: 12 }}>{t('BRIEF_LIST_SHARE_INACTIVE')}</span>;
  }
  if (brief.shareViewCount > 0) {
    const tooltip = brief.shareLastViewedAt ? format(new Date(brief.shareLastViewedAt), 'MMM dd, yyyy HH:mm') : '';
    return (
      <Tooltip title={tooltip}>
        <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>
          <EyeOutlined /> {brief.shareViewCount} {t('BRIEF_LIST_VIEWS')}
        </span>
      </Tooltip>
    );
  }
  return <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>{t('BRIEF_LIST_SHARED')}</span>;
};

const renderOffersCell = (
  brief: BriefV2ListItem,
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
  const [duplicateBrief, { isLoading: isDuplicating }] = useDuplicateBriefAiMutation();
  const [deleteBrief, { isLoading: isDeleting }] = useDeleteBriefAiMutation();
  const [renameBrief, { isLoading: isRenaming }] = useRenameBriefAiMutation();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const projectName = brief.projectName || t('UNTITLED_BRIEF');
  const formattedCreated = brief.createdAt ? format(new Date(brief.createdAt), 'MMM dd, yyyy') : '';

  const handleClick = () => {
    router.push(AppRoute.BRIEF_V2_DETAIL(brief.id));
  };

  const handleCompareClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(AppRoute.BRIEF_COMPARISON(brief.id));
  };

  const handleRenameOpen = () => {
    setRenameValue(projectName);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      return;
    }
    try {
      await renameBrief({ briefId: brief.id, projectName: trimmed }).unwrap();
      message.success(t('BRIEF_RENAME_SUCCESS'));
      setRenameModalOpen(false);
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateBrief(brief.id).unwrap();
      message.success(t('BRIEF_DUPLICATE_SUCCESS'));
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
      key: 'duplicate',
      label: t('BRIEF_DUPLICATE'),
      disabled: isDuplicating,
      onClick: handleDuplicate,
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
            <div className={styles.projectName}>{projectName.toUpperCase()}</div>
            <div className={styles.assignee}>v{brief.version}</div>
          </div>
        </div>

        <div className={styles.statusCell}>
          <PrStatus status={brief.status as ProjectStatus} />
        </div>

        <div className={styles.messagesCell}>
          <span className={styles.numericValue}>{brief.messageCount}</span>
        </div>

        <div className={styles.versionCell}>
          <span className={styles.numericValue}>v{brief.version}</span>
        </div>

        <div className={styles.offersCell}>{renderOffersCell(brief, handleCompareClick)}</div>

        <div className={styles.shareCell}>{renderShareBadge(brief)}</div>

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
