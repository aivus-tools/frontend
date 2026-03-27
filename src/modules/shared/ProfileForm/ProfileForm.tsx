'use client';

import React, { useEffect, useRef } from 'react';
import { Form, Input, Button, App, Spin } from 'antd';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '@/services/client/profileApi';
import {
  ProfileFormWrapper,
  PageTitle,
  AvatarSection,
  AvatarWrapper,
  AvatarOverlay,
  AvatarImage,
  AvatarPlaceholder,
  FormSection,
  FieldLabel,
} from './styled';

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      <ProfileFormWrapper>
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      </ProfileFormWrapper>
    );
  }

  return (
    <ProfileFormWrapper>
      <PageTitle>{t('PROFILE')}</PageTitle>

      <AvatarSection>
        <AvatarWrapper onClick={handleAvatarClick}>
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={t('AVATAR')} />
          ) : (
            <AvatarPlaceholder>
              <UserOutlined />
            </AvatarPlaceholder>
          )}
          <AvatarOverlay className="avatar-overlay">
            {isUploadingAvatar ? <Spin size="small" /> : <CameraOutlined />}
          </AvatarOverlay>
        </AvatarWrapper>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
      </AvatarSection>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <FormSection>
          <FieldLabel>{t('YOUR_NAME')}</FieldLabel>
          <Form.Item name="name" rules={[{ required: true, message: t('NAME_PLACEHOLDER') }]}>
            <Input placeholder={t('NAME_PLACEHOLDER')} size="large" />
          </Form.Item>
        </FormSection>

        <FormSection>
          <FieldLabel>{t('EMAIL')}</FieldLabel>
          <Input
            value={profile?.email ?? ''}
            disabled
            size="large"
            style={{ marginBottom: 24 }}
          />
        </FormSection>

        <FormSection>
          <FieldLabel>{t('COMPANY_NAME')}</FieldLabel>
          <Form.Item name="company">
            <Input placeholder={t('COMPANY_NAME')} size="large" />
          </Form.Item>
        </FormSection>

        <FormSection>
          <FieldLabel>{t('POSITION')}</FieldLabel>
          <Form.Item name="position">
            <Input placeholder={t('POSITION')} size="large" />
          </Form.Item>
        </FormSection>

        <Button type="primary" htmlType="submit" loading={isUpdating} size="large">
          {t('SAVE_PROFILE')}
        </Button>
      </Form>
    </ProfileFormWrapper>
  );
};
