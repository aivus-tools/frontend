'use client';

import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { App, Button, Input, Popconfirm, Select } from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useDeleteBriefAiMutation, useUpdateBriefAiSettingsMutation } from '@/services/client/briefAiApi';
import { BriefV3Detail } from '@/types/briefAi.interface';

interface BriefSettingsProps {
  brief: BriefV3Detail;
}

const Wrapper = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8f9fb;
`;

const Card = styled.section`
  max-width: 720px;
  margin: 0 auto 24px;
  background: #ffffff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RowLabel = styled.label`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6b7280;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const StatList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`;

const StatItem = styled.div`
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #4b5675;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #99a1b7;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const DangerCard = styled(Card)`
  border-color: #fee2e2;
`;

export const BriefSettings: React.FC<BriefSettingsProps> = ({ brief }) => {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const { data: session } = useSession();
  const isStaff = Boolean((session?.user as { isStaff?: boolean } | undefined)?.isStaff);

  const [title, setTitle] = useState(brief.title ?? '');
  const [language, setLanguage] = useState<'en' | 'ru'>((brief.documentLanguage as 'en' | 'ru') || 'en');

  useEffect(() => {
    setTitle(brief.title ?? '');
    setLanguage((brief.documentLanguage as 'en' | 'ru') || 'en');
  }, [brief.id, brief.title, brief.documentLanguage]);

  const [updateSettings, { isLoading: isSaving }] = useUpdateBriefAiSettingsMutation();
  const [deleteBrief, { isLoading: isDeleting }] = useDeleteBriefAiMutation();

  const isDirty =
    title.trim() !== (brief.title ?? '').trim() || language !== ((brief.documentLanguage as 'en' | 'ru') || 'en');

  const handleSave = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      messageApi.error(t('UNEXPECTED_ERROR'));
      return;
    }
    try {
      await updateSettings({
        briefId: brief.id,
        title: trimmed,
        documentLanguage: language,
      }).unwrap();
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
    <Wrapper>
      <Card>
        <CardHeader>{t('BRIEF_V3_TAB_SETTINGS')}</CardHeader>

        <Row>
          <RowLabel>{t('BRIEF_V3_SETTINGS_TITLE_LABEL')}</RowLabel>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} allowClear />
        </Row>

        <Row>
          <RowLabel>{t('BRIEF_V3_SETTINGS_LANGUAGE_LABEL')}</RowLabel>
          <Select
            value={language}
            onChange={(value) => setLanguage(value as 'en' | 'ru')}
            options={[
              { label: 'English', value: 'en' },
              { label: 'Русский', value: 'ru' },
            ]}
            style={{ maxWidth: 240 }}
          />
        </Row>

        <Actions>
          <Button
            type='primary'
            icon={<SaveOutlined />}
            loading={isSaving}
            disabled={!isDirty || title.trim().length === 0}
            onClick={handleSave}
          >
            {t('BRIEF_V3_SETTINGS_SAVE')}
          </Button>
        </Actions>
      </Card>

      {isStaff ? (
        <Card>
          <CardHeader>{t('BRIEF_V3_SETTINGS_TRACES_HEADER')}</CardHeader>
          <StatList>
            <StatItem>
              <StatLabel>{t('BRIEF_V3_SETTINGS_TRACES_MESSAGES')}</StatLabel>
              <StatValue>{brief.messageCount}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>{t('BRIEF_V3_SETTINGS_TRACES_TOKENS')}</StatLabel>
              <StatValue>
                {brief.totalInputTokens} / {brief.totalOutputTokens}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>{t('BRIEF_V3_SETTINGS_TRACES_COST')}</StatLabel>
              <StatValue>${Number(brief.totalCostUsd || 0).toFixed(4)}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>{t('BRIEF_V3_SETTINGS_TRACES_STATUS')}</StatLabel>
              <StatValue>{brief.conversationStatus}</StatValue>
            </StatItem>
          </StatList>
        </Card>
      ) : null}

      <DangerCard>
        <CardHeader>{t('BRIEF_V3_SETTINGS_SECTION_DANGER')}</CardHeader>
        <Actions>
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
        </Actions>
      </DangerCard>
    </Wrapper>
  );
};
