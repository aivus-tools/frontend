'use client';
import styles from '../styles.module.css';
import { Button, Form, Input, message, Tooltip } from 'antd';
import { useState } from 'react';
import { Steps } from './types';
import { AuthType } from '@/types/user';
import { AUTH_TYPES } from '@/lib/constants';
import { useAuthType } from '../context/auth-type';

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
          messageApi.info('Please sign in with Google');
        }
      } else {
        nextAction('register', email);
      }
    } catch (error) {
      setLoading(false);
      messageApi.error('An unexpected error occurred');
      console.error('Error checking email:', error);
    } finally {
      setLoading(false);
    }
  };

  const disabled = authType === AUTH_TYPES.google;
  const title = disabled ? 'You have already registered with Google. Please sign in with Google' : undefined;

  return (
    <Form form={form} layout='vertical' style={{ marginTop: 20 }} onFinish={handleFinish} disabled={disabled}>
      {contextHolder}
      <div className={styles.inputWrapper}>
        <Form.Item
          name='email'
          noStyle
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email' },
          ]}
        >
          <Input placeholder='Your email address' id='email' name='email' size='large' />
        </Form.Item>
      </div>
      <Tooltip title={title} placement='bottom'>
        <Button block type='primary' size='large' loading={loading} disabled={loading || disabled} htmlType='submit'>
          Next
        </Button>
      </Tooltip>
    </Form>
  );
};
