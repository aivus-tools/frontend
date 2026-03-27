'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Flex, Typography, Button, Form, Input, message } from 'antd';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { ApiRoute } from '@/constants/apiRoute';

type ResetState = 'idle' | 'pending' | 'success' | 'error';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [status, setStatus] = useState<ResetState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      const msg = t('INVALID_TOKEN');
      setErrorMessage(msg);
      messageApi.error(msg);
    }
  }, [token, messageApi]);

  const handleSubmit = async ({ password, confirmPassword }: { password: string; confirmPassword: string }) => {
    if (!token) {
      messageApi.error(t('INVALID_TOKEN'));
      return;
    }

    if (password !== confirmPassword) {
      messageApi.error(t('PASSWORDS_DO_NOT_MATCH'));
      return;
    }

    try {
      setStatus('pending');
      const response = await fetch(`${ApiRoute.RESET_PASSWORD}?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || response.statusText);
      }
      messageApi.success(t('PASSWORD_RESET_SUCCESS'));
      setStatus('success');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : t('PASSWORD_RESET_FAILED');
      setErrorMessage(errMsg);
      setStatus('error');
      messageApi.error(errMsg);
    }
  };

  const renderContent = () => {
    if (status === 'success') {
      return (
        <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
          <Typography.Title level={3}>{t('PASSWORD_RESET_SUCCESS_TITLE')}</Typography.Title>
          <Typography.Text type='secondary' style={{ textAlign: 'center', maxWidth: 400 }}>
            {t('PASSWORD_RESET_SUCCESS_MESSAGE')}
          </Typography.Text>
          <Link href={AppRoute.AUTH}>
            <Button type='primary'>{t('GO_TO_LOGIN')}</Button>
          </Link>
        </Flex>
      );
    }

    if (status === 'error' || !token) {
      return (
        <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
          <Typography.Title level={3}>{t('PASSWORD_RESET_FAILED_TITLE')}</Typography.Title>
          <Typography.Text type='danger' style={{ textAlign: 'center', maxWidth: 400 }}>
            {errorMessage ?? t('PASSWORD_RESET_FAILED')}
          </Typography.Text>
          <Flex gap={12}>
            <Link href={AppRoute.AUTH}>
              <Button>{t('BACK')}</Button>
            </Link>
            <Link href={AppRoute.FORGOT_PASSWORD}>
              <Button type='primary'>{t('REQUEST_NEW_LINK')}</Button>
            </Link>
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
        <Typography.Title level={3}>{t('RESET_PASSWORD_TITLE')}</Typography.Title>
        <Typography.Text type='secondary' style={{ textAlign: 'center', maxWidth: 400 }}>
          {t('RESET_PASSWORD_MESSAGE')}
        </Typography.Text>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          style={{ width: '100%', maxWidth: 400, marginTop: 24 }}
        >
          <Form.Item
            name='password'
            rules={[
              { required: true, message: t('PASSWORD_REQUIRED') },
              { min: 8, message: t('PASSWORD_MIN_LENGTH') },
            ]}
          >
            <Input.Password placeholder={t('NEW_PASSWORD')} size='large' />
          </Form.Item>
          <Form.Item
            name='confirmPassword'
            dependencies={['password']}
            rules={[
              { required: true, message: t('CONFIRM_PASSWORD_REQUIRED') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('PASSWORDS_DO_NOT_MATCH')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('CONFIRM_NEW_PASSWORD')} size='large' />
          </Form.Item>
          <Form.Item>
            <Button block type='primary' size='large' loading={status === 'pending'} htmlType='submit'>
              {t('RESET_PASSWORD')}
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

  return (
    <>
      {contextHolder}
      {renderContent()}
    </>
  );
};

export default ResetPasswordPage;

