'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Button, App } from 'antd';
import { DeleteOutlined, FileOutlined, PaperClipOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { BriefAttachment } from '@/types/briefAi.interface';

import styles from './FileUploadZone.module.css';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
  DOCX_MIME,
];
const ALLOWED = new Set(ALLOWED_MIME_TYPES);
const ACCEPT = ALLOWED_MIME_TYPES.concat('.docx').join(',');
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileUploadZoneProps {
  attachments: BriefAttachment[];
  uploading: boolean;
  disabled?: boolean;
  maxFiles: number;
  onUpload: (file: File) => Promise<void> | void;
  onDelete: (attachmentId: string) => Promise<void> | void;
}

export const FileUploadZone = (props: FileUploadZoneProps) => {
  const { message } = App.useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pickFiles = () => {
    if (props.disabled || props.uploading) {
      return;
    }
    inputRef.current?.click();
  };

  const validate = useCallback(
    (file: File): string | null => {
      if (props.attachments.length >= props.maxFiles) {
        return t('BRIEF_V3_ATTACH_LIMIT_REACHED', String(props.maxFiles));
      }
      if (file.size > MAX_FILE_SIZE) {
        return t('BRIEF_V3_ATTACH_TOO_LARGE');
      }
      if (!ALLOWED.has(file.type) && !file.name.toLowerCase().endsWith('.docx')) {
        return t('BRIEF_V3_ATTACH_WRONG_TYPE');
      }
      return null;
    },
    [props.attachments.length, props.maxFiles]
  );

  const handleFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const error = validate(file);
      if (error) {
        message.error(error);
        continue;
      }
      try {
        await props.onUpload(file);
      } catch {
        message.error(t('BRIEF_V3_ATTACH_UPLOAD_FAILED'));
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (props.disabled || props.uploading) {
      return;
    }
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const zoneClassName = dragging ? `${styles.zone} ${styles.zoneDragging}` : styles.zone;

  return (
    <div>
      <div
        className={zoneClassName}
        onClick={pickFiles}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className={styles.zoneTitle}>
          <PaperClipOutlined /> {t('BRIEF_V3_ATTACH_TITLE')}
        </div>
        <div className={styles.zoneHintWrapper}>
          <div className={styles.zoneHint}>{t('BRIEF_V3_ATTACH_HINT')}</div>
        </div>
        <input
          ref={inputRef}
          type='file'
          accept={ACCEPT}
          multiple
          className={styles.hiddenInput}
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
            }
          }}
        />
      </div>

      {props.attachments.length > 0 && (
        <div className={styles.attachmentList}>
          {props.attachments.map((attachment) => (
            <div key={attachment.id} className={styles.attachmentRow}>
              <FileOutlined />
              <div className={styles.attachmentMeta}>
                <div className={styles.attachmentName}>{attachment.filename}</div>
                <span className={styles.attachmentSize}>
                  {attachment.mimeType} · {formatBytes(attachment.sizeBytes)}
                </span>
              </div>
              <Button
                size='small'
                type='text'
                danger
                icon={<DeleteOutlined />}
                onClick={() => props.onDelete(attachment.id)}
                disabled={props.disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
