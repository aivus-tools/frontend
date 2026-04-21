'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HomeIcon from '@/icons/home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import { BetaBadge } from '@/components/BetaBadge/BetaBadge';
import { styled } from 'styled-components';
import { Theme } from '@/types/index.interface';
import { THEME } from '@/constants/constants';
import { AppRoute } from '@/constants/appRoute';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import { t } from '@/lib/i18n';
import { useUploadXlsxMutation } from '@/services/client/xlsxApi';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

const IconWrapper = styled.div<{ $themeType: Theme }>`
  display: flex;
  align-items: center;
  justify-content: start;
  height: 70px;
  color: ${({ $themeType }) => ($themeType === THEME.light ? 'var(--main-dark)' : '#fff')};
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  padding: 30px;
  gap: 12px;
`;

const SidebarContent = styled.div`
  padding: 16px 20px;
  color: #ffffff;
`;

const UploadArea = styled.div`
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

export const ClientSidebar = ({ theme }: { theme: Theme }) => {
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
    },
    [uploadXlsx, router]
  );

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Link href={AppRoute.DASHBOARD} prefetch={false}>
        <IconWrapper $themeType={theme}>
          <IconGroup>
            <HomeIcon />
            <LogoIcon />
            <BetaBadge size='sm' />
          </IconGroup>
        </IconWrapper>
      </Link>

      <SidebarContent />

      <Upload accept='.xlsx' showUploadList={false} customRequest={handleUpload} disabled={isUploading}>
        <UploadArea>
          <UploadIcon>{isUploading ? <LoadingOutlined /> : <UploadOutlined />}</UploadIcon>
          <UploadText>{isUploading ? t('UPLOADING') : t('UPLOAD_XLSX_TITLE')}</UploadText>
          <UploadHint>{t('UPLOAD_XLSX_HINT')}</UploadHint>
        </UploadArea>
      </Upload>
    </div>
  );
};
