'use client';

import React, { useEffect, useState } from 'react';
import { App, Button, Input, Popconfirm } from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getLocale, t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useDeleteBriefAiMutation, useUpdateBriefAiSettingsMutation } from '@/services/client/briefAiApi';
import { BriefV3Detail } from '@/types/briefAi.interface';

import styles from './BriefSettings.module.css';

interface BriefSettingsProps {
  brief: BriefV3Detail;
}

export const BriefSettings = (props: BriefSettingsProps) => {
  const { brief } = props;
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const { data: session } = useSession();
  const isStaff = Boolean((session?.user as { isStaff?: boolean } | undefined)?.isStaff);

  const [title, setTitle] = useState(brief.title ?? '');

  useEffect(() => {
    setTitle(brief.title ?? '');
  }, [brief.id, brief.title]);

  const [updateSettings, { isLoading: isSaving }] = useUpdateBriefAiSettingsMutation();
  const [deleteBrief, { isLoading: isDeleting }] = useDeleteBriefAiMutation();

  const isDirty = title.trim() !== (brief.title ?? '').trim();

  const languageLabel = getLanguageLabel(brief.documentLanguage);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      messageApi.error(t('UNEXPECTED_ERROR'));
      return;
    }
    try {
      await updateSettings({ briefId: brief.id, title: trimmed }).unwrap();
      messageApi.success(t('BRIEF_V3_SETTINGS_SAVED'));
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBrief(brief.id).unwrap();
      router.push(AppRoute.DASHBOARD);
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        <h3 className={styles.cardHeader}>{t('BRIEF_V3_TAB_SETTINGS')}</h3>

        <div className={styles.row}>
          <label className={styles.rowLabel}>{t('BRIEF_V3_SETTINGS_TITLE_LABEL')}</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} allowClear />
        </div>

        <div className={styles.row}>
          <label className={styles.rowLabel}>{t('BRIEF_V3_SETTINGS_LANGUAGE_LABEL')}</label>
          <div className={styles.languageInfo}>
            <span className={styles.languageValue}>{languageLabel}</span>
            <p className={styles.languageHint}>{t('BRIEF_V3_SETTINGS_LANGUAGE_INFO')}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type='primary'
            icon={<SaveOutlined />}
            loading={isSaving}
            disabled={!isDirty || title.trim().length === 0}
            onClick={handleSave}
          >
            {t('BRIEF_V3_SETTINGS_SAVE')}
          </Button>
        </div>
      </section>

      {isStaff ? (
        <section className={styles.card}>
          <h3 className={styles.cardHeader}>{t('BRIEF_V3_SETTINGS_TRACES_HEADER')}</h3>
          <div className={styles.statList}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>{t('BRIEF_V3_SETTINGS_TRACES_MESSAGES')}</div>
              <div className={styles.statValue}>{brief.messageCount}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>{t('BRIEF_V3_SETTINGS_TRACES_TOKENS')}</div>
              <div className={styles.statValue}>
                {brief.totalInputTokens} / {brief.totalOutputTokens}
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>{t('BRIEF_V3_SETTINGS_TRACES_COST')}</div>
              <div className={styles.statValue}>${Number(brief.totalCostUsd || 0).toFixed(4)}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>{t('BRIEF_V3_SETTINGS_TRACES_STATUS')}</div>
              <div className={styles.statValue}>{brief.conversationStatus}</div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${styles.card} ${styles.cardDanger}`}>
        <h3 className={styles.cardHeader}>{t('BRIEF_V3_SETTINGS_SECTION_DANGER')}</h3>
        <div className={styles.actions}>
          <Popconfirm
            title={t('BRIEF_V3_SETTINGS_DELETE_CONFIRM')}
            okText={t('BRIEF_V3_SETTINGS_DELETE_YES')}
            cancelText={t('BRIEF_V3_SETTINGS_DELETE_CANCEL')}
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={handleDelete}
          >
            <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
              {t('BRIEF_V3_SETTINGS_DELETE')}
            </Button>
          </Popconfirm>
        </div>
      </section>
    </div>
  );
};

const getLanguageLabel = (code: string): string => {
  if (!code) {
    return t('BRIEF_V3_SETTINGS_LANGUAGE_AUTO');
  }
  try {
    const displayNames = new Intl.DisplayNames([getLocale()], { type: 'language' });
    return displayNames.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};
