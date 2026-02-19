'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flex, Typography, Button, Form, Input, message } from 'antd';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { ApiRoute } from '@/constants/apiRoute';
import logger from '@/lib/logger';

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async ({ email }: { email: string }) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(ApiRoute.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || response.statusText);
      }
      setEmailSent(true);
      messageApi.success(t('PASSWORD_RESET_EMAIL_SENT'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('PASSWORD_RESET_REQUEST_FAILED');
      messageApi.error(errorMessage);
      logger.error('Error requesting password reset:', error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
        {contextHolder}
        <Typography.Title level={3}>{t('PASSWORD_RESET_EMAIL_SENT_TITLE')}</Typography.Title>
        <Typography.Text type='secondary' style={{ textAlign: 'center', maxWidth: 400 }}>
          {t('PASSWORD_RESET_EMAIL_SENT_MESSAGE')}
        </Typography.Text>
        <Link href={AppRoute.AUTH}>
          <Button type='primary'>{t('BACK_TO_LOGIN')}</Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
      {contextHolder}
      <Typography.Title level={3}>{t('FORGOT_PASSWORD_TITLE')}</Typography.Title>
      <Typography.Text type='secondary' style={{ textAlign: 'center', maxWidth: 400 }}>
        {t('FORGOT_PASSWORD_MESSAGE')}
      </Typography.Text>
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        style={{ width: '100%', maxWidth: 400, marginTop: 24 }}
      >
        <Form.Item
          name='email'
          rules={[
            { required: true, message: t('EMAIL_REQUIRED') },
            { type: 'email', message: t('INVALID_EMAIL') },
          ]}
        >
          <Input placeholder={t('YOUR_EMAIL_ADDRESS')} size='large' />
        </Form.Item>
        <Form.Item>
          <Button block type='primary' size='large' loading={loading} htmlType='submit'>
            {t('SEND_RESET_LINK')}
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href={AppRoute.AUTH}>
          <Button type='link' style={{ padding: 0 }}>
            {t('BACK_TO_LOGIN')}
          </Button>
        </Link>
      </div>
    </Flex>
  );
};

export default ForgotPasswordPage;

