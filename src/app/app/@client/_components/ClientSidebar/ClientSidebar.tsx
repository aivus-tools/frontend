'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { styled } from 'styled-components';
import { Theme } from '@/types/index.interface';
import { AppRoute } from '@/constants/appRoute';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import { t } from '@/lib/i18n';
import { useUploadXlsxMutation } from '@/services/client/xlsxApi';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { ClientHomeLogo } from '../ClientHomeLogo/ClientHomeLogo';
import { ClientNavbar } from '../ClientNavbar/ClientNavbar';

interface ClientSidebarProps {
  theme: Theme;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

const SidebarRoot = styled.div<{ $variant: 'desktop' | 'mobile' }>`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  ${(x) => x.$variant === 'mobile' && 'gap: 12px; padding: 8px 12px 16px; box-sizing: border-box;'}
`;

const DesktopFiller = styled.div`
  flex: 1;
`;

const MobileNavSection = styled.div`
  width: 100%;
`;

const UploadAreaDesktop = styled.div`
  margin-top: auto;
  padding: 20px;
  position: absolute;
  bottom: 20px;
  left: 12px;
  right: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const UploadAreaMobile = styled.div`
  margin-top: auto;
  padding: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const UploadIcon = styled.div`
  font-size: 24px;
  color: #ffffff;
  opacity: 0.6;
  margin-bottom: 8px;
`;

const UploadText = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  color: #ffffff;
  opacity: 0.8;
  line-height: 1.4;
`;

const UploadHint = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 10px;
  color: #ffffff;
  opacity: 0.5;
  margin-top: 4px;
`;

export const ClientSidebar: React.FC<ClientSidebarProps> = (props) => {
  const variant = props.variant ?? 'desktop';
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

  const uploadInner = (
    <>
      <UploadIcon>{isUploading ? <LoadingOutlined /> : <UploadOutlined />}</UploadIcon>
      <UploadText>{isUploading ? t('UPLOADING') : t('UPLOAD_XLSX_TITLE')}</UploadText>
      <UploadHint>{t('UPLOAD_XLSX_HINT')}</UploadHint>
    </>
  );

  return (
    <SidebarRoot $variant={variant}>
      <ClientHomeLogo theme={props.theme} />
      {variant === 'mobile' && (
        <MobileNavSection>
          <ClientNavbar variant='mobile' onNavigate={props.onNavigate} />
        </MobileNavSection>
      )}
      <DesktopFiller />
      <Upload accept='.xlsx' showUploadList={false} customRequest={handleUpload} disabled={isUploading}>
        {variant === 'mobile' ? (
          <UploadAreaMobile>{uploadInner}</UploadAreaMobile>
        ) : (
          <UploadAreaDesktop>{uploadInner}</UploadAreaDesktop>
        )}
      </Upload>
    </SidebarRoot>
  );
};
