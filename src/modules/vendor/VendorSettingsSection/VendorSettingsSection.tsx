'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Input, Button, App, Spin } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import {
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useUploadVendorLogoMutation,
  useLazySuggestVendorSlugQuery,
  useLazyCheckVendorSlugQuery,
} from '@/services/client/vendorSettingsApi';
import { usePublicAppOrigin } from '@/hooks/usePublicAppOrigin';

import styles from './VendorSettingsSection.module.css';

const { TextArea } = Input;

const SLUG_DEBOUNCE_MS = 600;
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,38}[a-z0-9]$|^[a-z0-9]{3}$/;

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
  customAiInstructions: string;
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

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

  const origin = usePublicAppOrigin();
  const slugAddon = `${origin.replace(/^https?:\/\//, '')}/brief/`;

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
        customAiInstructions: settings.customAiInstructions || '',
      });
    }
  }, [settings, form]);

  const handleSlugSuggest = async () => {
    try {
      const result = await suggestSlug().unwrap();
      const suggested = result.slug;
      form.setFieldsValue({ slug: suggested });
      await validateSlugRemote(suggested);
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
    const value = event.target.value.trim().toLowerCase();
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
      form.scrollToField('slug');
      return;
    }
    try {
      await updateSettings({
        companyName: values.companyName,
        agencyName: values.agencyName,
        // Default production / post-production percentages are temporarily hidden.
        slug: values.slug || null,
        leadNotificationEmail: values.leadNotificationEmail,
        customAiInstructions: values.customAiInstructions,
      }).unwrap();
      originalSlugRef.current = values.slug || null;
      message.success('Company settings saved');
    } catch (error: unknown) {
      const status =
        typeof error === 'object' && error != null && 'status' in error ? (error as { status: number }).status : null;
      if (status === 409) {
        setSlugStatus('taken');
        return;
      }
      message.error(getBackendErrorMessage(error) ?? 'Failed to save settings');
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
            addonBefore={slugAddon}
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

        <Form.Item
          name='customAiInstructions'
          label={t('VENDOR_SETTINGS_AI_INSTRUCTIONS_LABEL')}
          extra={t('VENDOR_SETTINGS_AI_INSTRUCTIONS_EXTRA')}
        >
          <TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            showCount
            maxLength={500}
            placeholder={t('VENDOR_SETTINGS_AI_INSTRUCTIONS_PLACEHOLDER')}
          />
        </Form.Item>

        {/* Temporarily hidden until offers/estimation are re-enabled.
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
        */}

        <Button type='primary' htmlType='submit' loading={isUpdating} size='large' className={styles.submitButton}>
          Save Company Settings
        </Button>
      </Form>
    </div>
  );
};

const getBackendErrorMessage = (error: unknown): string | null => {
  if (typeof error !== 'object' || error == null || !('data' in error)) {
    return null;
  }
  const data = (error as { data: unknown }).data;
  if (typeof data !== 'object' || data == null || !('error' in data)) {
    return null;
  }
  const value = (data as { error: unknown }).error;
  return typeof value === 'string' ? value : null;
};
