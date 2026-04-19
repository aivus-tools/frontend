'use client';

import React from 'react';
import { styled } from 'styled-components';
import { App, Button, Tabs } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { ApiRoute } from '@/constants/apiRoute';
import { downloadPdf } from '@/helpers/downloadPdf';
import { t } from '@/lib/i18n';
import { BriefFinalDocument, BriefShareView } from '@/types/briefAi.interface';

const Wrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fb;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #eef0f4;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
`;

const HeaderHint = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #99a1b7;
`;

const Body = styled.div`
  flex: 1;
  padding: 20px 24px 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`;

const PreviewCard = styled.div`
  background: #ffffff;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  padding: 28px 32px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.7;

  h1 {
    font-size: 22px;
    margin: 0 0 12px 0;
    color: #111827;
  }
  h2 {
    font-size: 16px;
    margin: 20px 0 8px 0;
    border-bottom: 1px solid #eef0f4;
    padding-bottom: 4px;
  }
  h3 {
    font-size: 14px;
    margin: 12px 0 4px 0;
  }
  ul,
  ol {
    padding-left: 22px;
    margin: 0 0 8px 0;
  }
  p {
    margin: 0 0 8px 0;
  }
  a {
    color: #2288ff;
  }
  blockquote {
    border-left: 3px solid #d0d5dd;
    padding-left: 10px;
    color: #6b7280;
    margin: 8px 0;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const DOCUMENT_TITLES: Record<string, string> = {
  production_brief: 'Production Brief',
  vendor_email: 'Vendor Outreach Email',
  deliverables_checklist: 'Deliverables Checklist',
};

const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') return html;
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText;
};

const SharedDocumentTab: React.FC<{ token: string; doc: BriefFinalDocument }> = ({ token, doc }) => {
  const { message: messageApi } = App.useApp();

  const handleCopy = async (mode: 'html' | 'text') => {
    try {
      const value = mode === 'html' ? doc.html : doc.plainText || htmlToPlainText(doc.html);
      await navigator.clipboard.writeText(value);
      messageApi.success(t('BRIEF_V3_COPIED'));
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleDownload = async () => {
    try {
      await downloadPdf(
        ApiRoute.PUBLIC_BRIEF_SHARE_DOCUMENT_PDF(token, doc.id),
        `${DOCUMENT_TITLES[doc.kind] ?? 'Brief'}.pdf`
      );
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  return (
    <div>
      <ActionBar>
        <Button icon={<CopyOutlined />} onClick={() => handleCopy('text')}>
          {t('BRIEF_V3_COPY_TEXT')}
        </Button>
        <Button icon={<CopyOutlined />} onClick={() => handleCopy('html')}>
          {t('BRIEF_V3_COPY_HTML')}
        </Button>
        <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownload}>
          {t('BRIEF_V3_DOWNLOAD_PDF')}
        </Button>
      </ActionBar>
      <PreviewCard dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
};

export const BriefSharedView: React.FC<{ data: BriefShareView }> = ({ data }) => {
  const byKind = new Map(data.documents.map((x) => [x.kind, x]));

  // Deliverables are folded into Production Brief; hide legacy tab.
  const items = [
    {
      key: 'production_brief',
      label: t('BRIEF_V3_TAB_PRODUCTION_BRIEF'),
      document: byKind.get('production_brief'),
    },
    {
      key: 'vendor_email',
      label: t('BRIEF_V3_TAB_VENDOR_EMAIL'),
      document: byKind.get('vendor_email'),
    },
  ];

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>{data.title || t('BRIEF_V3_SHARED_HEADER')}</HeaderTitle>
        <HeaderHint>{t('BRIEF_V3_SHARED_HEADER')}</HeaderHint>
      </Header>
      <Body>
        <Tabs
          defaultActiveKey='production_brief'
          items={items.map((item) => ({
            key: item.key,
            label: item.label,
            children: item.document ? (
              <SharedDocumentTab token={data.token} doc={item.document} />
            ) : (
              <div style={{ color: '#99a1b7', padding: 24 }}>{t('BRIEF_V3_DOCUMENT_MISSING')}</div>
            ),
          }))}
        />
      </Body>
    </Wrapper>
  );
};
