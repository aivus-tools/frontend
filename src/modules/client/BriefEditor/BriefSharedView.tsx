'use client';

import React from 'react';
import { App, Button, Tabs } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { ApiRoute } from '@/constants/apiRoute';
import { downloadPdf } from '@/helpers/downloadPdf';
import { t } from '@/lib/i18n';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { BriefFinalDocument, BriefShareView } from '@/types/briefAi.interface';

import styles from './BriefSharedView.module.css';

const DOCUMENT_TITLES: Record<string, string> = {
  production_brief: 'Production Brief',
  vendor_email: 'Vendor Outreach Email',
  deliverables_checklist: 'Deliverables Checklist',
};

const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') {
    return html;
  }
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText;
};

interface SharedDocumentTabProps {
  token: string;
  doc: BriefFinalDocument;
}

const SharedDocumentTab = (props: SharedDocumentTabProps) => {
  const { message: messageApi } = App.useApp();

  const handleCopy = async (mode: 'html' | 'text') => {
    try {
      const value = mode === 'html' ? props.doc.html : props.doc.plainText || htmlToPlainText(props.doc.html);
      await navigator.clipboard.writeText(value);
      messageApi.success(t('BRIEF_V3_COPIED'));
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleDownload = async () => {
    try {
      await downloadPdf(
        ApiRoute.PUBLIC_BRIEF_SHARE_DOCUMENT_PDF(props.token, props.doc.id),
        `${DOCUMENT_TITLES[props.doc.kind] ?? 'Brief'}.pdf`
      );
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  return (
    <div>
      <div className={styles.actionBar}>
        <Button icon={<CopyOutlined />} onClick={() => handleCopy('text')}>
          {t('BRIEF_V3_COPY_TEXT')}
        </Button>
        <Button icon={<CopyOutlined />} onClick={() => handleCopy('html')}>
          {t('BRIEF_V3_COPY_HTML')}
        </Button>
        <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownload}>
          {t('BRIEF_V3_DOWNLOAD_PDF')}
        </Button>
      </div>
      <div className={styles.previewCard} dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.doc.html) }} />
    </div>
  );
};

interface BriefSharedViewProps {
  data: BriefShareView;
}

const CLIENT_FACING_KINDS = ['production_brief', 'deliverables_checklist'] as const;

export const BriefSharedView = (props: BriefSharedViewProps) => {
  const byKind = new Map(props.data.documents.map((x) => [x.kind, x]));

  const items = CLIENT_FACING_KINDS.map((kind) => ({
    key: kind,
    label: kind === 'production_brief' ? t('BRIEF_V3_TAB_PRODUCTION_BRIEF') : t('BRIEF_V3_TAB_DELIVERABLES'),
    document: byKind.get(kind),
  })).filter((x) => !!x.document);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>{props.data.title || t('BRIEF_V3_SHARED_HEADER')}</div>
        <span className={styles.headerHint}>{t('BRIEF_V3_SHARED_HEADER')}</span>
      </header>
      <div className={styles.body}>
        <Tabs
          defaultActiveKey='production_brief'
          items={items.map((x) => ({
            key: x.key,
            label: x.label,
            children: x.document ? (
              <SharedDocumentTab token={props.data.token} doc={x.document} />
            ) : (
              <div className={styles.missingDoc}>{t('BRIEF_V3_DOCUMENT_MISSING')}</div>
            ),
          }))}
        />
      </div>
    </div>
  );
};
