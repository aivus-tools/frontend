'use client';

import React, { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { Button, App } from 'antd';
import { DeleteOutlined, FileOutlined, PaperClipOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { BriefAttachment } from '@/types/briefAi.interface';
import { media } from '@/styles/breakpoints';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/gif,text/plain';
const ALLOWED = new Set(ACCEPT.split(','));
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Zone = styled.div<{ $dragging: boolean }>`
  border: 1px dashed ${(x) => (x.$dragging ? '#2288ff' : '#d0d5dd')};
  background: ${(x) => (x.$dragging ? '#f0f7ff' : '#fafbfc')};
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'Montserrat', sans-serif;

  &:hover {
    border-color: #2288ff;
    background: #f6faff;
  }

  ${media.mobile} {
    padding: 14px 16px;
  }
`;

const ZoneHintWrapper = styled.div`
  display: contents;

  ${media.mobile} {
    display: none;
  }
`;

const ZoneTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #4b5675;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ZoneHint = styled.div`
  font-size: 11px;
  color: #99a1b7;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

const AttachmentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #4b5675;
`;

const AttachmentMeta = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AttachmentName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const AttachmentSize = styled.span`
  font-size: 10px;
  color: #99a1b7;
`;

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

export const FileUploadZone: React.FC<FileUploadZoneProps> = (props) => {
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
      if (!ALLOWED.has(file.type)) {
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

  return (
    <div>
      <Zone
        $dragging={dragging}
        onClick={pickFiles}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <ZoneTitle>
          <PaperClipOutlined /> {t('BRIEF_V3_ATTACH_TITLE')}
        </ZoneTitle>
        <ZoneHintWrapper>
          <ZoneHint>{t('BRIEF_V3_ATTACH_HINT')}</ZoneHint>
        </ZoneHintWrapper>
        <input
          ref={inputRef}
          type='file'
          accept={ACCEPT}
          multiple
          style={{ display: 'none' }}
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
            }
          }}
        />
      </Zone>

      {props.attachments.length > 0 && (
        <AttachmentList>
          {props.attachments.map((attachment) => (
            <AttachmentRow key={attachment.id}>
              <FileOutlined />
              <AttachmentMeta>
                <AttachmentName>{attachment.filename}</AttachmentName>
                <AttachmentSize>
                  {attachment.mimeType} · {formatBytes(attachment.sizeBytes)}
                </AttachmentSize>
              </AttachmentMeta>
              <Button
                size='small'
                type='text'
                danger
                icon={<DeleteOutlined />}
                onClick={() => props.onDelete(attachment.id)}
                disabled={props.disabled}
              />
            </AttachmentRow>
          ))}
        </AttachmentList>
      )}
    </div>
  );
};
