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

const buildResponseExample = (origin: string): string =>
  [
    `// HTTP 201`,
    `{`,
    `  "briefId": "1f2e3d4c-5b6a-...",`,
    `  "token": "a1b2c3d4...",`,
    `  "taskId": "9f8e7d6c...",`,
    `  "briefUrl": "${origin}/public-brief/1f2e3d4c-5b6a-...?token=a1b2c3d4..."`,
    `}`,
  ].join('\n');

const buildBackendSnippet = (url: string): string =>
  [
    `// backend/aivus.web.js`,
    `import { Permissions, webMethod } from 'wix-web-module';`,
    `import { getSecret } from 'wix-secrets-backend';`,
    `import { fetch } from 'wix-fetch';`,
    ``,
    `// Reads the key from the Secrets Manager, posts the lead to Aivus`,
    `// and returns briefUrl from the response.`,
    `export const submitBrief = webMethod(Permissions.Anyone, async (data) => {`,
    `  const key = await getSecret('aivusWebhookKey');`,
    `  const response = await fetch('${url}', {`,
    `    method: 'POST',`,
    `    headers: {`,
    `      'Content-Type': 'application/json',`,
    `      'X-Aivus-Webhook-Key': key,`,
    `    },`,
    `    body: JSON.stringify(data),`,
    `  });`,
    `  const { briefUrl } = await response.json();`,
    `  return briefUrl;`,
    `});`,
  ].join('\n');

const buildPageSnippet = (): string =>
  [
    `// Page code`,
    `import wixLocation from 'wix-location';`,
    `import { submitBrief } from 'backend/aivus.web';`,
    ``,
    `$w.onReady(() => {`,
    `  $w('#submitButton').onClick(async () => {`,
    `    const briefUrl = await submitBrief({`,
    `      email: $w('#email').value,`,
    `      name: $w('#name').value,`,
    `      message: $w('#message').value,`,
    `      files: [], // optional: [{ url, filename }] public links from your upload field`,
    `    });`,
    `    wixLocation.to(briefUrl);`,
    `  });`,
    `});`,
  ].join('\n');

const buildHtmlFormSnippet = (url: string, key: string): string =>
  [
    `<form action="${url}?autoredirect=1" method="POST">`,
    `  <input type="hidden" name="key" value="${key}" />`,
    `  <input type="email" name="email" placeholder="Email" required />`,
    `  <input type="text" name="name" placeholder="Name" />`,
    `  <textarea name="message" placeholder="Tell us about your project"></textarea>`,
    `  <button type="submit">Send</button>`,
    `</form>`,
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
  const [wixBackendCopied, setWixBackendCopied] = useState(false);
  const [wixPageCopied, setWixPageCopied] = useState(false);
  const [wixHtmlCopied, setWixHtmlCopied] = useState(false);

  const embedUrl = `${origin}${AppRoute.BRANDED_BRIEF(props.slug)}?embed=1`;
  const embedSnippet = `<iframe src="${embedUrl}" width="100%" height="700" frameborder="0"></iframe>`;
  const webhookUrl = `${PUBLIC_API_URL}${WEBHOOK_PATH}`;
  const key = webhookKey?.key ?? '';
  const codeSnippet = buildSnippet(codeLang, webhookUrl, key || 'YOUR_WEBHOOK_KEY');
  const responseExample = buildResponseExample(origin);
  const backendSnippet = buildBackendSnippet(webhookUrl);
  const pageSnippet = buildPageSnippet();
  const htmlFormSnippet = buildHtmlFormSnippet(webhookUrl, key || 'YOUR_WEBHOOK_KEY');

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

      <Typography.Text strong>{t('VENDOR_WEBHOOK_DOC_RESPONSE')}</Typography.Text>
      <Input.TextArea value={responseExample} readOnly rows={lineCount(responseExample)} className={styles.codeArea} />
      <Typography.Paragraph type='secondary'>{t('VENDOR_WEBHOOK_DOC_AUTOREDIRECT')}</Typography.Paragraph>
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

      <Typography.Title level={5}>{t('VENDOR_WIX_B_TITLE')}</Typography.Title>
      <ol className={styles.wixSteps}>
        <li>{t('VENDOR_WIX_B_STEP_1')}</li>
        <li>{t('VENDOR_WIX_B_STEP_2')}</li>
        <li>{t('VENDOR_WIX_B_STEP_3')}</li>
        <li>{t('VENDOR_WIX_B_STEP_4')}</li>
      </ol>

      <Typography.Text strong>{t('VENDOR_WIX_B_CODE_LABEL')}</Typography.Text>
      <Input.TextArea value={backendSnippet} readOnly rows={lineCount(backendSnippet)} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(backendSnippet, setWixBackendCopied)}>
        {wixBackendCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
      </Button>

      <Typography.Text strong>{t('VENDOR_WIX_PAGE_CODE_LABEL')}</Typography.Text>
      <Input.TextArea value={pageSnippet} readOnly rows={lineCount(pageSnippet)} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(pageSnippet, setWixPageCopied)}>
        {wixPageCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
      </Button>

      <Typography.Title level={5}>{t('VENDOR_WIX_C_TITLE')}</Typography.Title>
      <Typography.Paragraph type='secondary'>{t('VENDOR_WIX_C_DESC')}</Typography.Paragraph>
      <Typography.Text strong>{t('VENDOR_WIX_C_CODE_LABEL')}</Typography.Text>
      <Input.TextArea value={htmlFormSnippet} readOnly rows={lineCount(htmlFormSnippet)} className={styles.codeArea} />
      <Button type='primary' icon={<CopyOutlined />} onClick={() => copy(htmlFormSnippet, setWixHtmlCopied)}>
        {wixHtmlCopied ? t('BRANDED_BRIEF_EMBED_COPIED') : t('BRANDED_BRIEF_EMBED_COPY')}
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
