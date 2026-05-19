'use client';

import React, { useEffect, useRef } from 'react';
import { Form, Input, Button, App, Spin } from 'antd';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation } from '@/services/client/profileApi';

import styles from './ProfileForm.module.css';

interface ProfileFormValues {
  name: string;
  company: string;
  position: string;
}

export const ProfileForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProfileFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        company: profile.company,
        position: profile.position,
      });
    }
  }, [profile, form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values).unwrap();
      message.success(t('PROFILE_SAVED'));
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await uploadAvatar(formData).unwrap();
      message.success(t('AVATAR_UPLOADED'));
    } catch {
      message.error(t('AVATAR_UPLOAD_FAILED'));
    }
  };

  if (isLoadingProfile) {
    return (
      <div className={styles.profileFormWrapper}>
        <Spin size='large' className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.profileFormWrapper}>
      <h1 className={styles.pageTitle}>{t('PROFILE')}</h1>

      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
          {profile?.avatar_url ? (
            <img className={styles.avatarImage} src={profile.avatar_url} alt={t('AVATAR')} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <UserOutlined />
            </div>
          )}
          <div className={styles.avatarOverlay}>{isUploadingAvatar ? <Spin size='small' /> : <CameraOutlined />}</div>
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className={styles.hiddenInput}
          onChange={handleAvatarChange}
        />
      </div>

      <Form form={form} layout='vertical' onFinish={handleSubmit}>
        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('YOUR_NAME')}</label>
          <Form.Item name='name' rules={[{ required: true, message: t('NAME_PLACEHOLDER') }]}>
            <Input placeholder={t('NAME_PLACEHOLDER')} size='large' />
          </Form.Item>
        </div>

        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('EMAIL')}</label>
          <Input value={profile?.email ?? ''} disabled size='large' className={styles.emailInput} />
        </div>

        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('COMPANY_NAME')}</label>
          <Form.Item name='company'>
            <Input placeholder={t('COMPANY_NAME')} size='large' />
          </Form.Item>
        </div>

        <div className={styles.formSection}>
          <label className={styles.fieldLabel}>{t('POSITION')}</label>
          <Form.Item name='position'>
            <Input placeholder={t('POSITION')} size='large' />
          </Form.Item>
        </div>

        <Button type='primary' htmlType='submit' loading={isUpdating} size='large'>
          {t('SAVE_PROFILE')}
        </Button>
      </Form>
    </div>
  );
};
