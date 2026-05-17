'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Theme } from '@/types/index.interface';
import { AppRoute } from '@/constants/appRoute';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import { t } from '@/lib/i18n';
import { useUploadXlsxMutation } from '@/services/client/xlsxApi';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { ClientHomeLogo } from '../ClientHomeLogo/ClientHomeLogo';
import { ClientNavbar } from '../ClientNavbar/ClientNavbar';

import styles from './ClientSidebar.module.css';

interface ClientSidebarProps {
  theme: Theme;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

const cn = (...names: Array<string | false | null | undefined>): string => names.filter(Boolean).join(' ');

export const ClientSidebar = (props: ClientSidebarProps) => {
  const variant = props.variant ?? 'desktop';
  const isMobile = variant === 'mobile';
  const router = useRouter();
  const [uploadXlsx, { isLoading: isUploading }] = useUploadXlsxMutation();

  const handleUpload = useCallback(
    async (options: UploadRequestOption) => {
      const { file } = options;
      const uploadFile = file as File;

      if (!uploadFile.name.endsWith('.xlsx')) {
        message.error(t('XLSX_FILES_ONLY'));
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile);

      try {
        const result = await uploadXlsx(formData).unwrap();
        if (result.has_share && result.share_token) {
          message.success(t('OFFER_FOUND'));
          router.push(AppRoute.PUBLIC_OFFER(result.share_token));
        } else {
          message.warning(t('NO_OFFER_FOUND'));
        }
      } catch {
        message.error(t('UPLOAD_FAILED'));
      }
      props.onNavigate?.();
    },
    [uploadXlsx, router, props]
  );

  return (
    <div className={cn(styles.root, isMobile && styles.rootMobile)}>
      <ClientHomeLogo theme={props.theme} />
      {isMobile && (
        <div className={styles.mobileNav}>
          <ClientNavbar variant='mobile' onNavigate={props.onNavigate} />
        </div>
      )}
      <div className={styles.filler} />
      <Upload accept='.xlsx' showUploadList={false} customRequest={handleUpload} disabled={isUploading}>
        <div className={cn(styles.uploadArea, isMobile ? styles.uploadAreaMobile : styles.uploadAreaDesktop)}>
          <div className={styles.uploadIcon}>{isUploading ? <LoadingOutlined /> : <UploadOutlined />}</div>
          <div className={styles.uploadText}>{isUploading ? t('UPLOADING') : t('UPLOAD_XLSX_TITLE')}</div>
          <div className={styles.uploadHint}>{t('UPLOAD_XLSX_HINT')}</div>
        </div>
      </Upload>
    </div>
  );
};
