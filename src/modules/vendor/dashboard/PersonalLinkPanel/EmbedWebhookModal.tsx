'use client';

import React, { useState } from 'react';
import { App, Button, Input, Modal, Popconfirm, Segmented, Spin, Tabs, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { PUBLIC_API_URL } from '@/constants/constants';
import { useGetVendorWebhookKeyQuery, useRotateVendorWebhookKeyMutation } from '@/services/client/vendorSettingsApi';
import { usePublicAppOrigin } from '@/hooks/usePublicAppOrigin';

import styles from './PersonalLinkPanel.module.css';

interface EmbedWebhookModalProps {
  value: boolean;
  onChange: (open: boolean) => void;
  slug: string;
}

type CodeLang = 'curl' | 'js' | 'python';

const WEBHOOK_PATH = '/api/v1/public/briefs/ai/from-webhook';

const buildSnippet = (lang: CodeLang, url: string, key: string): string => {
  if (lang === 'curl') {
    return [
      `curl -X POST '${url}' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -H 'X-Aivus-Webhook-Key: ${key}' \\`,
      `  -d '{`,
      `    "email": "client@example.com",`,
      `    "name": "Jane Doe",`,
      `    "message": "We need a 30s product video for a launch.",`,
      `    "files": [{"url": "https://yoursite.com/uploads/brief.pdf", "filename": "brief.pdf"}]`,
      `  }'`,
    ].join('\n');
  }
  if (lang === 'js') {
    return [
      `await fetch('${url}', {`,
      `  method: 'POST',`,
      `  headers: {`,
      `    'Content-Type': 'application/json',`,
      `    'X-Aivus-Webhook-Key': '${key}',`,
      `  },`,
      `  body: JSON.stringify({`,
      `    email: 'client@example.com',`,
      `    name: 'Jane Doe',`,
      `    message: 'We need a 30s product video for a launch.',`,
      `    files: [{ url: 'https://yoursite.com/uploads/brief.pdf', filename: 'brief.pdf' }],`,
      `  }),`,
      `});`,
    ].join('\n');
  }
  return [
    `import requests`,
    ``,
    `requests.post(`,
    `    '${url}',`,
    `    headers={'X-Aivus-Webhook-Key': '${key}'},`,
    `    json={`,
    `        'email': 'client@example.com',`,
    `        'name': 'Jane Doe',`,
    `        'message': 'We need a 30s product video for a launch.',`,
    `        'files': [{'url': 'https://yoursite.com/uploads/brief.pdf', 'filename': 'brief.pdf'}],`,
    `    },`,
    `)`,
  ].join('\n');
};

const buildWixBody = (key: string): string =>
  [
    `{`,
    `  "email": "client@example.com",`,
    `  "name": "Jane Doe",`,
    `  "message": "We need a 30s product video for a launch.",`,
    `  "key": "${key}",`,
    `  "files": [`,
    `    { "url": "https://yoursite.com/uploads/brief.pdf", "filename": "brief.pdf" }`,
    `  ]`,
    `}`,
  ].join('\n');

const buildVeloSnippet = (url: string): string =>
  [
    `import { getSecret } from 'wix-secrets-backend';`,
    `import { fetch } from 'wix-fetch';`,
    ``,
    `// Wix Automations action "Run Velo code", trigger = form submission.`,
    `// Keep the wrapper the action generates; map your form fields below.`,
    `export async function invoke(payload) {`,
    `  const key = await getSecret('aivusWebhookKey');`,
    `  await fetch('${url}', {`,
    `    method: 'POST',`,
    `    headers: {`,
    `      'Content-Type': 'application/json',`,
    `      'X-Aivus-Webhook-Key': key,`,
    `    },`,
    `    body: JSON.stringify({`,
    `      email: payload.email,`,
    `      name: payload.name,`,
    `      message: payload.message,`,
    `      // files: array of { url, filename } public links from your form's upload field`,
    `      files: payload.files,`,
    `    }),`,
    `  });`,
    `}`,
  ].join('\n');

export const EmbedWebhookModal = (props: EmbedWebhookModalProps) => {
  const { message: messageApi } = App.useApp();
  const origin = usePublicAppOrigin();
  const { data: webhookKey, isLoading: isKeyLoading } = useGetVendorWebhookKeyQuery();
  const [rotate, { isLoading: isRotating }] = useRotateVendorWebhookKeyMutation();
  const [codeLang, setCodeLang] = useState<CodeLang>('curl');
  const [keyCopied, setKeyCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [wixBodyCopied, setWixBodyCopied] = useState(false);
  const [wixVeloCopied, setWixVeloCopied] = useState(false);

  const embedUrl = `${origin}${AppRoute.BRANDED_BRIEF(props.slug)}?embed=1`;
  const embedSnippet = `<iframe src="${embedUrl}" width="100%" height="700" frameborder="0"></iframe>`;
  const webhookUrl = `${PUBLIC_API_URL}${WEBHOOK_PATH}`;
  const key = webhookKey?.key ?? '';
  const codeSnippet = buildSnippet(codeLang, webhookUrl, key || 'YOUR_WEBHOOK_KEY');
  const wixBody = buildWixBody(key || 'YOUR_WEBHOOK_KEY');
  const veloSnippet = buildVeloSnippet(webhookUrl);

  const copy = async (value: string, mark: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      mark(true);
      setTimeout(() => mark(false), 2000);
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleRotate = async () => {
    try {
      await rotate().unwrap();
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const embedTab = (
    <div className={styles.modalSection}>
      <Typography.Paragraph type='secondary'>{t('BRANDED_BRIEF_EMBED_MODAL_TITLE')}</Typography.Paragraph>
      <Input.TextArea value={embedSnippet} readOnly rows={4} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(embedSnippet, setSnippetCopied)}>
        {snippetCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
      </Button>
    </div>
  );

  const webhookTab = isKeyLoading ? (
    <Spin size='small' />
  ) : (
    <div className={styles.modalSection}>
      <Typography.Paragraph type='secondary'>{t('VENDOR_WEBHOOK_DOC_INTRO')}</Typography.Paragraph>

      <Typography.Text strong>{t('VENDOR_SETTINGS_WEBHOOK_KEY_LABEL')}</Typography.Text>
      <div className={styles.webhookKeyRow}>
        <Input.Password readOnly value={key} className={styles.webhookKeyInput} />
        <Button icon={<CopyOutlined />} disabled={!key} onClick={() => copy(key, setKeyCopied)}>
          {keyCopied ? t('VENDOR_SETTINGS_WEBHOOK_KEY_COPIED') : t('VENDOR_SETTINGS_WEBHOOK_KEY_COPY')}
        </Button>
        <Popconfirm
          title={t('VENDOR_SETTINGS_WEBHOOK_KEY_REGENERATE_CONFIRM')}
          onConfirm={handleRotate}
          okText={t('VENDOR_SETTINGS_WEBHOOK_KEY_REGENERATE')}
        >
          <Button loading={isRotating}>{t('VENDOR_SETTINGS_WEBHOOK_KEY_REGENERATE')}</Button>
        </Popconfirm>
      </div>

      <Typography.Text strong>{t('VENDOR_WEBHOOK_DOC_ENDPOINT')}</Typography.Text>
      <Input readOnly value={`POST ${webhookUrl}`} className={styles.webhookEndpoint} />
      <Typography.Text type='warning'>{t('VENDOR_WEBHOOK_DOC_DOMAIN_HINT')}</Typography.Text>

      <Segmented
        value={codeLang}
        onChange={(v) => setCodeLang(v as CodeLang)}
        options={[
          { label: 'cURL', value: 'curl' },
          { label: 'JavaScript', value: 'js' },
          { label: 'Python', value: 'python' },
        ]}
      />
      <Input.TextArea value={codeSnippet} readOnly rows={lineCount(codeSnippet)} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(codeSnippet, setCodeCopied)}>
        {codeCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
      </Button>
      <Typography.Paragraph type='secondary'>{t('VENDOR_WEBHOOK_DOC_FILES_HINT')}</Typography.Paragraph>
    </div>
  );

  const wixTab = isKeyLoading ? (
    <Spin size='small' />
  ) : (
    <div className={styles.modalSection}>
      <Typography.Paragraph type='secondary'>{t('VENDOR_WIX_DOC_INTRO')}</Typography.Paragraph>

      <Typography.Text strong>{t('VENDOR_WEBHOOK_DOC_ENDPOINT')}</Typography.Text>
      <Input readOnly value={`POST ${webhookUrl}`} className={styles.webhookEndpoint} />
      <Typography.Text type='warning'>{t('VENDOR_WEBHOOK_DOC_DOMAIN_HINT')}</Typography.Text>

      <Typography.Text strong>{t('VENDOR_SETTINGS_WEBHOOK_KEY_LABEL')}</Typography.Text>
      <div className={styles.webhookKeyRow}>
        <Input.Password readOnly value={key} className={styles.webhookKeyInput} />
        <Button icon={<CopyOutlined />} disabled={!key} onClick={() => copy(key, setKeyCopied)}>
          {keyCopied ? t('VENDOR_SETTINGS_WEBHOOK_KEY_COPIED') : t('VENDOR_SETTINGS_WEBHOOK_KEY_COPY')}
        </Button>
      </div>

      <Typography.Title level={5}>{t('VENDOR_WIX_A_TITLE')}</Typography.Title>
      <ol className={styles.wixSteps}>
        <li>{t('VENDOR_WIX_A_STEP_1')}</li>
        <li>{t('VENDOR_WIX_A_STEP_2')}</li>
        <li>{t('VENDOR_WIX_A_STEP_3')}</li>
        <li>{t('VENDOR_WIX_A_STEP_4')}</li>
        <li>{t('VENDOR_WIX_A_STEP_5')}</li>
        <li>{t('VENDOR_WIX_A_STEP_6')}</li>
      </ol>
      <Typography.Text strong>{t('VENDOR_WIX_BODY_LABEL')}</Typography.Text>
      <Input.TextArea value={wixBody} readOnly rows={lineCount(wixBody)} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(wixBody, setWixBodyCopied)}>
        {wixBodyCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
      </Button>

      <Typography.Title level={5}>{t('VENDOR_WIX_B_TITLE')}</Typography.Title>
      <ol className={styles.wixSteps}>
        <li>{t('VENDOR_WIX_B_STEP_1')}</li>
        <li>{t('VENDOR_WIX_B_STEP_2')}</li>
        <li>{t('VENDOR_WIX_B_STEP_3')}</li>
        <li>{t('VENDOR_WIX_B_STEP_4')}</li>
      </ol>
      <Typography.Text strong>{t('VENDOR_WIX_B_CODE_LABEL')}</Typography.Text>
      <Input.TextArea value={veloSnippet} readOnly rows={lineCount(veloSnippet)} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(veloSnippet, setWixVeloCopied)}>
        {wixVeloCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
      </Button>
    </div>
  );

  return (
    <Modal
      open={props.value}
      title={t('VENDOR_EMBED_WEBHOOK_MODAL_TITLE')}
      onCancel={() => props.onChange(false)}
      footer={null}
      width={640}
    >
      <Tabs
        items={[
          { key: 'embed', label: t('VENDOR_EMBED_TAB'), children: embedTab },
          { key: 'webhook', label: t('VENDOR_WEBHOOK_TAB'), children: webhookTab },
          { key: 'wix', label: t('VENDOR_WIX_TAB'), children: wixTab },
        ]}
      />
    </Modal>
  );
};

const lineCount = (text: string): number => Math.min(16, Math.max(4, text.split('\n').length));
