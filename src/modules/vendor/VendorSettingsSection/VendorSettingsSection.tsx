'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Input, InputNumber, Button, App, Spin, Popconfirm, Typography } from 'antd';
import { CameraOutlined, CopyOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import {
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useUploadVendorLogoMutation,
  useLazySuggestVendorSlugQuery,
  useLazyCheckVendorSlugQuery,
  useGetVendorWebhookKeyQuery,
  useRotateVendorWebhookKeyMutation,
} from '@/services/client/vendorSettingsApi';

import styles from './VendorSettingsSection.module.css';

const SLUG_DEBOUNCE_MS = 600;
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9]|-[a-z0-9]){1,38}[a-z0-9]$|^[a-z0-9]{3,40}$/;

interface VendorSettingsFormValues {
  companyName: string;
  agencyName: string;
  fringesPercent: string;
  handlingPercent: string;
  markupPercent: string;
  productionInsurancePercent: string;
  productionFeePercent: string;
  postMarkupPercent: string;
  postInsurancePercent: string;
  postTaxPercent: string;
  slug: string;
  leadNotificationEmail: string;
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const WebhookKeySection = () => {
  const { message: messageApi } = App.useApp();
  const { data: webhookKey, isLoading } = useGetVendorWebhookKeyQuery();
  const [rotate, { isLoading: isRotating }] = useRotateVendorWebhookKeyMutation();
  const [keyCopied, setKeyCopied] = useState(false);

  const handleCopyKey = async () => {
    if (!webhookKey?.key) {
      return;
    }
    try {
      await navigator.clipboard.writeText(webhookKey.key);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
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

  if (isLoading) {
    return <Spin size='small' />;
  }

  return (
    <div className={styles.webhookSection}>
      <h4 className={styles.subTitleCompact}>{t('VENDOR_SETTINGS_WEBHOOK_KEY_LABEL')}</h4>
      {webhookKey?.key ? (
        <div className={styles.webhookRow}>
          <Input.Password readOnly value={webhookKey.key} className={styles.webhookInput} />
          <Button icon={<CopyOutlined />} onClick={handleCopyKey}>
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
      ) : (
        <div className={styles.webhookRow}>
          <Typography.Text type='secondary'>{t('VENDOR_SETTINGS_WEBHOOK_KEY_NONE')}</Typography.Text>
          <Popconfirm title={t('VENDOR_SETTINGS_WEBHOOK_KEY_REGENERATE_CONFIRM')} onConfirm={handleRotate}>
            <Button type='primary' loading={isRotating}>
              {t('VENDOR_SETTINGS_WEBHOOK_KEY_GENERATE')}
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};

export const VendorSettingsSection = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<VendorSettingsFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originalSlugRef = useRef<string | null>(null);

  const { data: settings, isLoading } = useGetVendorSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateVendorSettingsMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadVendorLogoMutation();
  const [suggestSlug] = useLazySuggestVendorSlugQuery();
  const [checkSlug] = useLazyCheckVendorSlugQuery();

  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');

  useEffect(() => {
    if (settings) {
      originalSlugRef.current = settings.slug;
      form.setFieldsValue({
        companyName: settings.companyName || '',
        agencyName: settings.agencyName || '',
        fringesPercent: settings.fringesPercent || '0',
        handlingPercent: settings.handlingPercent || '0',
        markupPercent: settings.markupPercent || '0',
        productionInsurancePercent: settings.productionInsurancePercent || '0',
        productionFeePercent: settings.productionFeePercent || '0',
        postMarkupPercent: settings.postMarkupPercent || '0',
        postInsurancePercent: settings.postInsurancePercent || '0',
        postTaxPercent: settings.postTaxPercent || '0',
        slug: settings.slug || '',
        leadNotificationEmail: settings.leadNotificationEmail || '',
      });
    }
  }, [settings, form]);

  const handleSlugSuggest = async () => {
    try {
      const result = await suggestSlug().unwrap();
      form.setFieldValue('slug', result.slug);
      setSlugStatus('available');
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  const validateSlugRemote = useCallback(
    async (value: string) => {
      if (!SLUG_PATTERN.test(value)) {
        setSlugStatus('invalid');
        return;
      }
      if (value === originalSlugRef.current) {
        setSlugStatus('available');
        return;
      }
      setSlugStatus('checking');
      try {
        const result = await checkSlug(value).unwrap();
        setSlugStatus(result.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    },
    [checkSlug]
  );

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (slugDebounceRef.current) {
      clearTimeout(slugDebounceRef.current);
    }
    if (!value) {
      setSlugStatus('idle');
      return;
    }
    slugDebounceRef.current = setTimeout(() => validateSlugRemote(value), SLUG_DEBOUNCE_MS);
  };

  const handleSubmit = async (values: VendorSettingsFormValues) => {
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
      return;
    }
    try {
      await updateSettings({
        companyName: values.companyName,
        agencyName: values.agencyName,
        fringesPercent: values.fringesPercent,
        handlingPercent: values.handlingPercent,
        markupPercent: values.markupPercent,
        productionInsurancePercent: values.productionInsurancePercent,
        productionFeePercent: values.productionFeePercent,
        postMarkupPercent: values.postMarkupPercent,
        postInsurancePercent: values.postInsurancePercent,
        postTaxPercent: values.postTaxPercent,
        slug: values.slug || null,
        leadNotificationEmail: values.leadNotificationEmail,
      }).unwrap();
      originalSlugRef.current = values.slug || null;
      message.success('Company settings saved');
    } catch (error: unknown) {
      const status =
        typeof error === 'object' && error != null && 'status' in error ? (error as { status: number }).status : null;
      if (status === 409) {
        setSlugStatus('taken');
      } else {
        message.error('Failed to save settings');
      }
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      await uploadLogo(formData).unwrap();
      message.success('Logo uploaded');
    } catch {
      message.error('Failed to upload logo');
    }
  };

  const slugHelp =
    slugStatus === 'checking'
      ? t('VENDOR_SETTINGS_SLUG_CHECKING')
      : slugStatus === 'taken'
        ? t('VENDOR_SETTINGS_SLUG_TAKEN')
        : slugStatus === 'invalid'
          ? t('VENDOR_SETTINGS_SLUG_INVALID')
          : '';

  const slugValidateStatus =
    slugStatus === 'taken' || slugStatus === 'invalid' ? 'error' : slugStatus === 'checking' ? 'validating' : '';

  if (isLoading) {
    return <Spin size='large' className={styles.spinner} />;
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Company Settings</h3>

      <div className={styles.logoWrapper}>
        <div onClick={handleLogoClick} className={styles.logoDrop}>
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt='Logo' className={styles.logoImage} />
          ) : (
            <div className={styles.logoPlaceholder}>
              {isUploadingLogo ? <Spin size='small' /> : <CameraOutlined style={{ fontSize: 24 }} />}
              <div className={styles.logoPlaceholderText}>Upload Logo</div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className={styles.fileInput}
          onChange={handleLogoChange}
        />
      </div>

      <Form form={form} layout='vertical' onFinish={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Form.Item name='companyName' label='Company Name' className={styles.itemFlex1}>
            <Input placeholder='Your company name' size='large' />
          </Form.Item>
          <Form.Item name='agencyName' label='Default Agency' className={styles.itemFlex1}>
            <Input placeholder='Default agency for new projects' size='large' />
          </Form.Item>
        </div>

        <h4 className={styles.subTitle}>{t('VENDOR_SETTINGS_SLUG_LABEL')}</h4>

        <Form.Item
          name='slug'
          validateStatus={slugValidateStatus}
          help={slugHelp || (settings?.slug ? t('VENDOR_SETTINGS_SLUG_CHANGE_WARNING') : '')}
        >
          <Input
            addonBefore={t('VENDOR_SETTINGS_SLUG_ADDON')}
            placeholder={t('VENDOR_SETTINGS_SLUG_PLACEHOLDER')}
            size='large'
            onChange={handleSlugChange}
            suffix={
              <Button type='link' size='small' onClick={handleSlugSuggest} className={styles.suggestButton}>
                {t('VENDOR_SETTINGS_SLUG_SUGGEST')}
              </Button>
            }
          />
        </Form.Item>

        <Form.Item name='leadNotificationEmail' label={t('VENDOR_SETTINGS_NOTIFICATION_EMAIL_LABEL')}>
          <Input type='email' placeholder={t('VENDOR_SETTINGS_NOTIFICATION_EMAIL_PLACEHOLDER')} size='large' />
        </Form.Item>

        <h4 className={styles.subTitle}>Default Production Percentages</h4>
        <div className={styles.percentsRow}>
          <Form.Item name='fringesPercent' label='Fringes %' className={styles.percentItem120}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
          <Form.Item name='handlingPercent' label='Handling %' className={styles.percentItem120}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
          <Form.Item name='markupPercent' label='Markup %' className={styles.percentItem120}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
          <Form.Item name='productionInsurancePercent' label='Prod Insurance %' className={styles.percentItem140}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
          <Form.Item name='productionFeePercent' label='Prod Fee %' className={styles.percentItem120}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
        </div>

        <h4 className={styles.subTitleCompact}>Default Post-Production Percentages</h4>
        <div className={styles.percentsRow}>
          <Form.Item name='postMarkupPercent' label='Post Markup %' className={styles.percentItem140}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
          <Form.Item name='postInsurancePercent' label='Post Insurance %' className={styles.percentItem140}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
          <Form.Item name='postTaxPercent' label='Post Tax %' className={styles.percentItem120}>
            <InputNumber step={0.01} min={0} className={styles.percentInput} />
          </Form.Item>
        </div>

        <Button type='primary' htmlType='submit' loading={isUpdating} size='large' className={styles.submitButton}>
          Save Company Settings
        </Button>
      </Form>

      <WebhookKeySection />
    </div>
  );
};
