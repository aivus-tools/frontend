'use client';

import React, { useEffect } from 'react';
import { Form, Input, Button, Select, App, Spin } from 'antd';
import { t, getLocale } from '@/lib/i18n';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useChangePasswordMutation,
} from '@/services/client/profileApi';

import styles from './SettingsForm.module.css';

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const SettingsForm = () => {
  const { message } = App.useApp();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [settingsForm] = Form.useForm();

  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  useEffect(() => {
    if (settings) {
      settingsForm.setFieldsValue({
        language: settings.language,
      });
    }
  }, [settings, settingsForm]);

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }).unwrap();
      message.success(t('PASSWORD_CHANGED'));
      passwordForm.resetFields();
    } catch {
      message.error(t('PASSWORD_CHANGE_FAILED'));
    }
  };

  const handleSettingsSubmit = async () => {
    try {
      const values = settingsForm.getFieldsValue();
      await updateSettings(values).unwrap();
      message.success(t('SETTINGS_SAVED'));
      if (values.language && values.language !== getLocale()) {
        document.cookie = `locale=${values.language};path=/;max-age=31536000`;
        window.location.reload();
      }
    } catch {
      message.error(t('SETTINGS_SAVE_FAILED'));
    }
  };

  if (isLoadingSettings) {
    return (
      <div className={styles.settingsFormWrapper}>
        <Spin size='large' className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.settingsFormWrapper}>
      <h1 className={styles.pageTitle}>{t('SETTINGS')}</h1>

      <h2 className={styles.sectionTitle}>{t('CHANGE_PASSWORD')}</h2>
      <Form form={passwordForm} layout='vertical' onFinish={handlePasswordSubmit}>
        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('CURRENT_PASSWORD')}</label>
          <Form.Item name='current_password' rules={[{ required: true, message: t('PASSWORD_REQUIRED') }]}>
            <Input.Password placeholder={t('CURRENT_PASSWORD')} size='large' />
          </Form.Item>
        </div>

        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('NEW_PASSWORD')}</label>
          <Form.Item
            name='new_password'
            rules={[
              { required: true, message: t('PASSWORD_REQUIRED') },
              { min: 8, message: t('PASSWORD_MIN_LENGTH') },
            ]}
          >
            <Input.Password placeholder={t('NEW_PASSWORD')} size='large' />
          </Form.Item>
        </div>

        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('CONFIRM_NEW_PASSWORD')}</label>
          <Form.Item
            name='confirm_password'
            dependencies={['new_password']}
            rules={[
              { required: true, message: t('CONFIRM_PASSWORD_REQUIRED') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('PASSWORDS_DO_NOT_MATCH')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('CONFIRM_NEW_PASSWORD')} size='large' />
          </Form.Item>
        </div>

        <Button type='primary' htmlType='submit' loading={isChangingPassword} size='large'>
          {t('CHANGE_PASSWORD')}
        </Button>
      </Form>

      <div className={styles.sectionDivider} />

      <Form form={settingsForm} layout='vertical'>
        <h2 className={styles.sectionTitle}>{t('LANGUAGE')}</h2>
        <div className={styles.formSection}>
          <Form.Item name='language'>
            <Select size='large' style={{ width: '100%' }}>
              <Select.Option value='en'>{t('LANGUAGE_ENGLISH')}</Select.Option>
              <Select.Option value='ru'>{t('LANGUAGE_RUSSIAN')}</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className={styles.sectionDivider} />

        <Button type='primary' onClick={handleSettingsSubmit} loading={isUpdatingSettings} size='large'>
          {t('SAVE_SETTINGS')}
        </Button>
      </Form>
    </div>
  );
};
