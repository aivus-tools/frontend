'use client';
import { Button, Form, Input, message } from 'antd';
import { signIn } from 'next-auth/react';
import { getLocale, t } from '@/lib/i18n';
import logger from '@/lib/logger';

import styles from './styles.module.css';
import { useState } from 'react';
import { AUTH_TYPES } from '@/constants/constants';
import { AuthType } from '@/types/user.interface';
import { AppRoute } from '@/constants/appRoute';
import { getPendingBrief } from '@/helpers/pendingBrief';

export interface ResponseData {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errorDetails: ErrorDetails;
}

export interface ErrorDetails {
  message: string[];
  error: string;
  statusCode: number;
}

const register = async ({
  name,
  email,
  authType,
  password = '',
  briefId,
  briefToken,
}: {
  name: string;
  email: string;
  authType: AuthType;
  password?: string;
  briefId?: string;
  briefToken?: string;
}) =>
  await fetch('/service/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name,
      authType,
      password,
      briefId,
      briefToken,
      language: getLocale(),
    }),
  });

type RegisterFormFields = {
  name: string;
  password: string;
  repeatPassword: string;
};

export const RegisterForm = ({ email, prevStepAction }: { email: string; prevStepAction: () => void }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async ({ name, password, repeatPassword }: RegisterFormFields) => {
    if (loading) {
      return;
    }
    if (password !== repeatPassword) {
      messageApi.error(t('PASSWORDS_DO_NOT_MATCH'));
      form.setFields([{ name: 'repeatPassword', errors: [''] }]);
      return;
    }
    setLoading(true);

    try {
      const pending = getPendingBrief();
      const response = await register({
        name,
        email,
        password,
        authType: AUTH_TYPES.credentials,
        briefId: pending?.briefId,
        briefToken: pending?.token,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.error) {
          const errors = Array.isArray(data.error) ? data.error : [data.error];
          form.setFields([{ name: 'password', errors: errors.map(String) }]);
        } else {
          messageApi.error(t('FAILED_TO_REGISTER'));
        }
        return;
      }
      messageApi.success(t('REGISTRATION_SUCCESSFUL'));
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        messageApi.error(t('INVALID_CREDENTIALS'));
        form.resetFields();
        form.setFields([{ name: 'password', errors: [''] }]);
      } else {
        window.location.href = AppRoute.CONFIRM;
      }
    } catch (error) {
      messageApi.error(t('UNEXPECTED_ERROR'));
      logger.error('Error checking email:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
      {contextHolder}
      <div className={styles.inputWrapper}>
        <Form.Item name='name' rules={[{ required: true, message: t('NAME_PLACEHOLDER') }]}>
          <Input size='large' placeholder={t('NAME_PLACEHOLDER')} type='text' id='name' name='name' />
        </Form.Item>
      </div>
      <div className={styles.inputWrapper}>
        <Form.Item
          name='password'
          rules={[
            { required: true, message: t('PASSWORD_REQUIRED') },
            { min: 8, message: t('PASSWORD_MIN_LENGTH') },
          ]}
        >
          <Input
            size='large'
            placeholder={t('ENTER_PASSWORD_PLACEHOLDER')}
            type='password'
            id='password'
            name='password'
          />
        </Form.Item>
      </div>
      <div className={styles.inputWrapper}>
        <Form.Item name='repeatPassword' rules={[{ required: true, message: t('CONFIRM_PASSWORD_REQUIRED') }]}>
          <Input
            size='large'
            placeholder={t('REPEAT_PASSWORD_PLACEHOLDER')}
            type='password'
            id='repeatPassword'
            name='repeatPassword'
          />
        </Form.Item>
      </div>
      <div className={styles.buttonRowGroup}>
        <Button htmlType='reset' block onClick={prevStepAction} disabled={loading}>
          {t('BACK')}
        </Button>
        <Button type='primary' htmlType='submit' block loading={loading}>
          {t('SIGN_UP')}
        </Button>
      </div>
    </Form>
  );
};
