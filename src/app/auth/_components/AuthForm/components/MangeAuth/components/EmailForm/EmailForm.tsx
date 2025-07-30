'use client';
import styles from './styles.module.css';
import { Button, Form, Input, message, Tooltip } from 'antd';
import { t } from '@/lib/i18n';
import { useState } from 'react';
import { Steps } from '@/types/auth.interface';
import { AuthType } from '@/types/user.interface.';
import { AUTH_TYPES } from '@/constants/constants';
import { useAuthType } from '@/context/AuthTypeProvider';

// TODO заменить на checkEmail из src/services/server/authService.ts
const checkEmail = async ({
  email,
}: {
  email: string;
}): Promise<{
  exists: boolean;
  authType: AuthType;
}> => {
  const response = await fetch('/service/auth/check-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  return await response.json();
};

export const EmailForm = ({ nextAction }: { nextAction: (step: Steps, email: string) => void }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setAuthType, authType } = useAuthType();

  const handleFinish = async ({ email }: { email: string }) => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      const res = await checkEmail({ email });
      if (res.exists) {
        if (res.authType === AUTH_TYPES.credentials) {
          nextAction('signin', email);
        } else if (res.authType === AUTH_TYPES.google) {
          setAuthType(res.authType);
          messageApi.info(t('PLEASE_SIGN_IN_WITH_GOOGLE'));
        }
      } else {
        nextAction('register', email);
      }
    } catch (error) {
      setLoading(false);
      messageApi.error(t('UNEXPECTED_ERROR'));
      console.error('Error checking email:', error);
    } finally {
      setLoading(false);
    }
  };

  const disabled = authType === AUTH_TYPES.google;
  const title = disabled ? t('ALREADY_REGISTERED_WITH_GOOGLE') : undefined;

  return (
    <Form form={form} layout='vertical' style={{ marginTop: 20 }} onFinish={handleFinish} disabled={disabled}>
      {contextHolder}
      <div className={styles.inputWrapper}>
        <Form.Item
          name='email'
          noStyle
          rules={[
            { required: true, message: t('EMAIL_REQUIRED') },
            { type: 'email', message: t('INVALID_EMAIL') },
          ]}
        >
          <Input placeholder={t('YOUR_EMAIL_ADDRESS')} id='email' name='email' size='large' />
        </Form.Item>
      </div>
      <Tooltip title={title} placement='bottom'>
        <Button block type='primary' size='large' loading={loading} disabled={loading || disabled} htmlType='submit'>
          {t('NEXT')}
        </Button>
      </Tooltip>
    </Form>
  );
};
