'use client';

import React from 'react';
import { Button, Card, List, Modal, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useGetBriefAiListQuery } from '@/services/client/briefAiApi';

import styles from './BriefSelectModal.module.css';

interface BriefSelectModalProps {
  value: boolean;
  onChange: (open: boolean) => void;
  vendorName: string;
  sentBriefIds: string[];
  onSelectNew: () => void;
  onSelectExisting: (briefId: string) => void;
}

export const BriefSelectModal = (props: BriefSelectModalProps) => {
  const { data: briefs = [], isLoading } = useGetBriefAiListQuery();

  const finalized = briefs.filter(
    (x) => x.conversationStatus === 'ready_to_finalize' || x.conversationStatus === 'finalized'
  );

  const handleSelectExisting = (briefId: string) => {
    props.onChange(false);
    props.onSelectExisting(briefId);
  };

  const handleSelectNew = () => {
    props.onChange(false);
    props.onSelectNew();
  };

  return (
    <Modal
      open={props.value}
      title={t('BRANDED_BRIEF_SELECT_TITLE')}
      onCancel={() => props.onChange(false)}
      footer={null}
      width={560}
    >
      <div className={styles.container}>
        <Card className={styles.newCard} hoverable onClick={handleSelectNew}>
          <div className={styles.newCardContent}>
            <PlusOutlined className={styles.newIcon} />
            <Typography.Text strong>{t('BRANDED_BRIEF_SELECT_NEW')}</Typography.Text>
          </div>
        </Card>

        {finalized.length > 0 ? (
          <>
            <Typography.Text type='secondary' className={styles.orLabel}>
              {t('BRANDED_BRIEF_SELECT_EXISTING')}
            </Typography.Text>
            <List
              loading={isLoading}
              dataSource={finalized}
              renderItem={(brief) => {
                const alreadySent = props.sentBriefIds.includes(brief.id);
                return (
                  <List.Item
                    key={brief.id}
                    className={alreadySent ? styles.sentItem : styles.listItem}
                    onClick={alreadySent ? undefined : () => handleSelectExisting(brief.id)}
                  >
                    <div className={styles.briefRow}>
                      <Typography.Text ellipsis className={styles.briefTitle}>
                        {brief.title || t('UNTITLED_BRIEF')}
                      </Typography.Text>
                      {alreadySent ? <Tag>{t('BRANDED_BRIEF_SELECT_ALREADY_SENT')}</Tag> : null}
                    </div>
                  </List.Item>
                );
              }}
            />
          </>
        ) : null}
      </div>
    </Modal>
  );
};
