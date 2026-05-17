'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { App } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useRenameBriefAiMutation } from '@/services/client/briefAiApi';

import styles from './EditableBriefTitle.module.css';

interface EditableBriefTitleProps {
  briefId: string;
  title: string;
  editable: boolean;
}

export const EditableBriefTitle = (props: EditableBriefTitleProps) => {
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

  const displayClassName = isEmpty ? `${styles.titleDisplay} ${styles.titleDisplayEmpty}` : styles.titleDisplay;

  return (
    <div className={styles.wrapper}>
      <Link className={styles.backLink} href={AppRoute.DASHBOARD}>
        {t('ALL_PROJECTS')}
      </Link>
      <span className={styles.separator}>/</span>
      {isEditing ? (
        <input
          ref={inputRef}
          className={styles.titleInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label={t('EDIT_BRIEF_TITLE')}
        />
      ) : (
        <button
          type='button'
          className={displayClassName}
          onClick={handleStartEdit}
          disabled={!props.editable || isLoading}
          title={props.editable ? t('EDIT_BRIEF_TITLE') : displayTitle}
        >
          <span>{displayTitle}</span>
          {props.editable ? <EditOutlined aria-hidden className={styles.editIcon} /> : null}
        </button>
      )}
    </div>
  );
};
