'use client';
import { Button, Form, Input, message } from 'antd';
import { signIn } from 'next-auth/react';
import styles from './styles.module.css';
import { useState } from 'react';
import { CALLBACK_URL } from '@/lib/apiRoute';

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
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        messageApi.error('Invalid credentials');
        form.resetFields();
        form.setFields([{ name: 'password', errors: [''] }]);
      } else {
        window.location.href = CALLBACK_URL ?? '/';
      }
    } catch (error) {
      messageApi.error('An unexpected error occurred');
      console.error('Error checking email:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
      {contextHolder}
      <div className={styles.inputWrapper}>
        <Form.Item name='password'>
          <Input size='large' placeholder='Enter your password' type='password' id='password' name='password' />
        </Form.Item>
      </div>
      <div className={styles.buttonRowGroup}>
        <Button onClick={prevStepAction} htmlType='reset' block disabled={loading}>
          Back
        </Button>
        <Button type='primary' htmlType='submit' block loading={loading} disabled={loading}>
          Sign in
        </Button>
      </div>
    </Form>
  );
};
