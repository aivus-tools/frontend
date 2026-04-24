'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { App } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { styled } from 'styled-components';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useRenameBriefAiMutation } from '@/services/client/briefAiApi';

interface EditableBriefTitleProps {
  briefId: string;
  title: string;
  editable: boolean;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
`;

const BackLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;

  &:hover {
    color: #2288ff;
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  color: #d0d5dd;
`;

const TitleDisplay = styled.button<{ $isEmpty: boolean }>`
  border: 1px dashed transparent;
  background: transparent;
  color: ${(x) => (x.$isEmpty ? '#9ca3af' : '#1f2937')};
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 560px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    border-color: #d0d5dd;
    background: #f5f7fa;
  }

  &:disabled {
    cursor: default;
    color: ${(x) => (x.$isEmpty ? '#9ca3af' : '#1f2937')};
  }
`;

const TitleInput = styled.input`
  border: 1px solid #2288ff;
  background: #ffffff;
  color: #1f2937;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  min-width: 320px;
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 136, 255, 0.15);
`;

export const EditableBriefTitle: React.FC<EditableBriefTitleProps> = (props) => {
  const { message: messageApi } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(props.title);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savingRef = useRef(false);
  const [renameBrief, { isLoading }] = useRenameBriefAiMutation();

  useEffect(() => {
    setDraft(props.title);
  }, [props.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const displayTitle = props.title || t('UNTITLED_BRIEF');
  const isEmpty = !props.title;

  const handleStartEdit = () => {
    if (!props.editable || isLoading) {
      return;
    }
    setDraft(props.title);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isLoading || savingRef.current) {
      return;
    }
    setDraft(props.title);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (savingRef.current) {
      return;
    }
    const trimmed = draft.trim();
    if (!trimmed) {
      messageApi.error(t('BRIEF_TITLE_RENAME_FAILED'));
      setDraft(props.title);
      setIsEditing(false);
      return;
    }
    if (trimmed === props.title) {
      setIsEditing(false);
      return;
    }
    savingRef.current = true;
    try {
      await renameBrief({ briefId: props.briefId, title: trimmed }).unwrap();
      setIsEditing(false);
    } catch {
      messageApi.error(t('BRIEF_TITLE_RENAME_FAILED'));
    } finally {
      savingRef.current = false;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  return (
    <Wrapper>
      <BackLink href={AppRoute.DASHBOARD}>{t('ALL_PROJECTS')}</BackLink>
      <Separator>/</Separator>
      {isEditing ? (
        <TitleInput
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label={t('EDIT_BRIEF_TITLE')}
        />
      ) : (
        <TitleDisplay
          type='button'
          $isEmpty={isEmpty}
          onClick={handleStartEdit}
          disabled={!props.editable || isLoading}
          title={props.editable ? t('EDIT_BRIEF_TITLE') : displayTitle}
        >
          <span>{displayTitle}</span>
          {props.editable ? <EditOutlined aria-hidden style={{ fontSize: 12, color: '#9ca3af' }} /> : null}
        </TitleDisplay>
      )}
    </Wrapper>
  );
};
