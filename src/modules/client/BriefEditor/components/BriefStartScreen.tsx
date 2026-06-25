import React from 'react';
import { Button } from 'antd';
import { t } from '@/lib/i18n';
import { VoiceRecorderButton } from '@/modules/client/BriefChat/VoiceRecorderButton';
import { BriefAttachment } from '@/types/briefAi.interface';
import { FileUploadZone } from './FileUploadZone';

import styles from '../BriefEditor.module.css';

interface BriefStartScreenProps {
  startText: string;
  onStartTextChange: (value: string) => void;
  pendingAttachments: BriefAttachment[];
  uploading: boolean;
  maxAttachments: number;
  onUploadAttachment: (file: File) => Promise<void> | void;
  onDeleteAttachment: (attachmentId: string) => Promise<void> | void;
  briefId: string | null;
  isPublic: boolean;
  token: string | null;
  isStarting: boolean;
  isStartVoiceBusy: boolean;
  onStartVoiceBusyChange: (busy: boolean) => void;
  onEnsureBrief: () => Promise<{ briefId: string; token: string | null } | null>;
  onStart: () => void;
  embedded?: boolean;
}

export const BriefStartScreen = (props: BriefStartScreenProps) => {
  return (
    <div className={styles.startScreen}>
      <div className={styles.startCard}>
        <h2 className={styles.startTitle}>{t('BRIEF_V3_START_TITLE')}</h2>
        <p className={styles.startSubtitle}>{t('BRIEF_V3_START_SUBTITLE')}</p>
        <textarea
          className={styles.startTextarea}
          value={props.startText}
          onChange={(event) => props.onStartTextChange(event.target.value)}
          placeholder={t('BRIEF_V3_START_PLACEHOLDER')}
        />
        <FileUploadZone
          attachments={props.pendingAttachments}
          uploading={props.uploading}
          maxFiles={props.maxAttachments}
          onUpload={props.onUploadAttachment}
          onDelete={props.onDeleteAttachment}
        />
        <div className={styles.startActions}>
          {!props.embedded ? (
            <div className={styles.startVoiceGroup}>
              <VoiceRecorderButton
                briefId={props.briefId}
                isPublic={props.isPublic}
                publicToken={props.token}
                disabled={props.isStarting || props.uploading}
                onTranscript={(text) =>
                  props.onStartTextChange(
                    props.startText.trim().length > 0 ? `${props.startText.trim()} ${text}` : text
                  )
                }
                onEnsureBrief={props.onEnsureBrief}
                onBusyChange={props.onStartVoiceBusyChange}
                compact
              />
              {!props.isStartVoiceBusy ? (
                <span className={styles.startVoiceHint}>{t('BRIEF_V3_VOICE_START_HINT')}</span>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          <Button
            type='primary'
            size='large'
            loading={props.isStarting}
            disabled={!props.startText.trim() || props.uploading || props.isStartVoiceBusy}
            onClick={props.onStart}
          >
            {t('BRIEF_V3_START_BUTTON')}
          </Button>
        </div>
      </div>
    </div>
  );
};
