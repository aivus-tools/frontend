'use client';

import React, { useState } from 'react';
import { App, Button, Card, Input, Modal, Typography } from 'antd';
import { CopyOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useGetVendorSettingsQuery } from '@/services/client/vendorSettingsApi';

import styles from './PersonalLinkPanel.module.css';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://go.aivus.co';

interface EmbedModalProps {
  value: boolean;
  onChange: (open: boolean) => void;
  slug: string;
}

const EmbedModal = (props: EmbedModalProps) => {
  const { message: messageApi } = App.useApp();
  const [copied, setCopied] = useState(false);

  const snippetUrl = `${BASE_URL}${AppRoute.BRANDED_BRIEF(props.slug)}?embed=1`;
  const snippet = `<iframe src="${snippetUrl}" width="100%" height="700" frameborder="0"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  return (
    <Modal
      open={props.value}
      title={t('BRANDED_BRIEF_EMBED_MODAL_TITLE')}
      onCancel={() => props.onChange(false)}
      footer={
        <Button type='primary' icon={<CopyOutlined />} onClick={handleCopy}>
          {copied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
        </Button>
      }
    >
      <Input.TextArea value={snippet} readOnly rows={4} className={styles.codeArea} />
    </Modal>
  );
};

export const PersonalLinkPanel = () => {
  const { message: messageApi } = App.useApp();
  const { data: settings, isLoading } = useGetVendorSettingsQuery();
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const slug = settings?.slug ?? null;
  const briefUrl = slug ? `${BASE_URL}${AppRoute.BRANDED_BRIEF(slug)}` : '';

  const handleCopy = async () => {
    if (!briefUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(briefUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  if (isLoading) {
    return null;
  }

  if (!slug) {
    return (
      <Card className={styles.card} loading={isLoading}>
        <div className={styles.emptyState}>
          <LinkOutlined className={styles.emptyIcon} />
          <Typography.Title level={5} className={styles.emptyTitle}>
            {t('VENDOR_PERSONAL_LINK_EMPTY_TITLE')}
          </Typography.Title>
          <Typography.Text className={styles.emptyDesc}>{t('VENDOR_PERSONAL_LINK_EMPTY_DESC')}</Typography.Text>
          <Link href={AppRoute.SETTINGS}>
            <Button type='primary'>{t('VENDOR_PERSONAL_LINK_EMPTY_ACTION')}</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={styles.card}
        title={t('VENDOR_PERSONAL_LINK_TITLE')}
        extra={
          <Typography.Text type='secondary' className={styles.brandingHint}>
            {t('VENDOR_PERSONAL_LINK_BRANDING_HINT')}{' '}
            <Link href={AppRoute.SETTINGS} className={styles.brandingLink}>
              {t('VENDOR_PERSONAL_LINK_BRANDING_ACTION')}
            </Link>
          </Typography.Text>
        }
      >
        <div className={styles.urlRow}>
          <Typography.Text code ellipsis className={styles.urlText}>
            {briefUrl}
          </Typography.Text>
          <div className={styles.actions}>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              {copied ? t('VENDOR_PERSONAL_LINK_COPIED') : t('VENDOR_PERSONAL_LINK_COPY')}
            </Button>
            <Button icon={<EyeOutlined />} onClick={() => window.open(briefUrl, '_blank')}>
              {t('VENDOR_PERSONAL_LINK_PREVIEW')}
            </Button>
            <Button onClick={() => setEmbedOpen(true)}>{t('VENDOR_PERSONAL_LINK_EMBED')}</Button>
          </div>
        </div>
      </Card>

      <EmbedModal value={embedOpen} onChange={setEmbedOpen} slug={slug} />
    </>
  );
};
