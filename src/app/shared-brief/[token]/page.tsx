'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { styled } from 'styled-components';
import { Button } from 'antd';
import { t } from '@/lib/i18n';
import { BriefEditor } from '@/modules/client/BriefEditorV2/BriefEditor';
import { useGetPublicBriefShareQuery } from '@/services/client/briefShareApi';
import { AppRoute } from '@/constants/appRoute';
import { ApiRoute } from '@/constants/apiRoute';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fb;
`;

const TopBar = styled.div`
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

const EditorArea = styled.div`
  flex: 1;
  overflow: auto;
`;

const Banner = styled.div`
  padding: 16px 24px;
  background: linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%);
  border-top: 1px solid #c4d9f8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const BannerText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const CenterMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  font-family: 'Montserrat', sans-serif;
  color: #4b5675;
`;

const SpinnerDot = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #eef0f4;
  border-top-color: #2288ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function SharedBriefPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { data, isLoading, error } = useGetPublicBriefShareQuery(token, { skip: !token });

  const handlePdf = async () => {
    try {
      const { downloadPdf } = await import('@/helpers/downloadPdf');
      await downloadPdf(ApiRoute.BRIEF_SHARE_PDF(token), 'Brief.pdf');
    } catch {
      // noop
    }
  };

  if (isLoading) {
    return (
      <CenterMessage>
        <SpinnerDot />
      </CenterMessage>
    );
  }

  if (error || !data) {
    return (
      <CenterMessage>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{t('SHARED_BRIEF_NOT_FOUND')}</div>
        <div>{t('SHARED_BRIEF_EXPIRED')}</div>
        <Button
          type='primary'
          onClick={() => router.push(AppRoute.PUBLIC_BRIEF)}
          style={{ background: '#FD8258', borderColor: '#FD8258', marginTop: 8 }}
        >
          {t('CREATE_YOUR_OWN_BRIEF')}
        </Button>
      </CenterMessage>
    );
  }

  return (
    <PageWrapper>
      <TopBar>
        <Logo>AIVUS</Logo>
        <Button onClick={handlePdf}>{t('BRIEF_V2_EXPORT_PDF')}</Button>
      </TopBar>
      <EditorArea>
        <BriefEditor
          documentHtml={data.brief.documentHtml}
          sectionsStatus={data.brief.sectionsStatus}
          sectionsChanged={[]}
          readOnly={true}
          totalCostUsd='0'
          onSectionEdit={null}
        />
      </EditorArea>
      <Banner>
        <BannerText>{t('BRIEF_V2_REGISTER_CTA')}</BannerText>
        <Button
          type='primary'
          onClick={() => router.push(AppRoute.AUTH)}
          style={{ background: '#2288FF', borderColor: '#2288FF', fontWeight: 600 }}
        >
          {t('BRIEF_V2_REGISTER_BUTTON')}
        </Button>
      </Banner>
    </PageWrapper>
  );
}
