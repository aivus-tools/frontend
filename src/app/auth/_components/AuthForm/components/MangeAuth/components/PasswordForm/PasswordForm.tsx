'use client';
import { Button, Form, Input, message } from 'antd';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';
import styles from './styles.module.css';
import { useState } from 'react';
import { CALLBACK_URL } from '@/constants/apiRoute';
import { AppRoute } from '@/constants/appRoute';
import { getPendingBrief, consumeAuthReturnUrl } from '@/helpers/pendingBrief';

export const PasswordForm = ({ email, prevStepAction }: { email: string; prevStepAction: () => void }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async ({ password }: { password: string }) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const pending = getPendingBrief();
      const result = await signIn('credentials', {
        email,
        password,
        briefId: pending?.briefId,
        briefToken: pending?.token,
        redirect: false,
      });
      if (result?.error) {
        messageApi.error(t('INVALID_CREDENTIALS'));
        form.resetFields();
        form.setFields([{ name: 'password', errors: [''] }]);
      } else {
        const returnUrl = consumeAuthReturnUrl();
        if (returnUrl) {
          window.location.href = returnUrl;
        } else if (pending) {
          window.location.href = AppRoute.BRIEF_DETAIL(pending.briefId);
        } else {
          window.location.href = CALLBACK_URL || AppRoute.HOME;
        }
      }
    } catch (error) {
      messageApi.error(t('UNEXPECTED_ERROR'));
      logger.error(t('ERROR_CHECKING_EMAIL'), error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
      {contextHolder}
      <div className={styles.inputWrapper}>
        <Form.Item
          name='password'
          style={{ marginBottom: 8 }}
          rules={[{ required: true, message: t('PASSWORD_REQUIRED') }]}
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
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Link href={AppRoute.FORGOT_PASSWORD} style={{ fontSize: '14px', fontWeight: 400 }}>
          {t('FORGOT_PASSWORD_TITLE')}
        </Link>
      </div>
      <div className={styles.buttonRowGroup}>
        <Button onClick={prevStepAction} htmlType='reset' block disabled={loading}>
          {t('BACK')}
        </Button>
        <Button type='primary' htmlType='submit' block loading={loading} disabled={loading}>
          {t('SIGN_IN')}
        </Button>
      </div>
    </Form>
  );
};
