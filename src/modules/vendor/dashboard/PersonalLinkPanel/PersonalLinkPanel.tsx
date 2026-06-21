'use client';

import React, { useState } from 'react';
import { App, Button, Card, Typography } from 'antd';
import { CopyOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useGetVendorSettingsQuery } from '@/services/client/vendorSettingsApi';
import { usePublicAppOrigin } from '@/hooks/usePublicAppOrigin';
import { EmbedWebhookModal } from './EmbedWebhookModal';

import styles from './PersonalLinkPanel.module.css';

export const PersonalLinkPanel = () => {
  const { message: messageApi } = App.useApp();
  const { data: settings, isLoading } = useGetVendorSettingsQuery();
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const origin = usePublicAppOrigin();

  const slug = settings?.slug ?? null;
  const briefUrl = slug ? `${origin}${AppRoute.BRANDED_BRIEF(slug)}` : '';

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

      <EmbedWebhookModal value={embedOpen} onChange={setEmbedOpen} slug={slug} />
    </>
  );
};
