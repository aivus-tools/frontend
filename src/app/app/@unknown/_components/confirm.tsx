'use client';
import { Button, Flex, message, Typography } from 'antd';

import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GROUPS } from '@/constants/constants';
import { logout } from '@/auth/actions/logout';
import { useConfirmEmailMutation } from '@/services/client/userApi';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';

type Error = {
  data: {
    message: string;
  };
};

const errorHasMessage = (error: unknown): error is Error => (error as Error)?.data?.message !== undefined;

export const Confirm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const session = useSession();
  const group = session.data?.user?.group;
  const [messageApi, contextHolder] = message.useMessage();

  const [confirmEmail, { isLoading }] = useConfirmEmailMutation();

  useEffect(() => {
    try {
      if (token) {
        confirmEmail(token)
          .unwrap()
          .then(() => {
            messageApi.success(t('EMAIL_CONFIRMED'));
            session.update();
            window.location.href = AppRoute.DASHBOARD;
          });
      }
    } catch (error) {
      messageApi.error(t('UNEXPECTED_ERROR'));

      if (errorHasMessage(error)) {
        messageApi.error(error.data.message);
      }
      console.error('Failed to confirm email:', error);
    }
  }, [confirmEmail, messageApi, session, token]);

  const render = () => {
    if (isLoading || group !== GROUPS.unconfirmed) {
      return <Spinner />;
    }
    return (
      <Flex align='center' justify='center' vertical gap={12} style={{ height: '100vh', width: '100%' }}>
        <Typography.Title level={3}>Please confirm your e-mail</Typography.Title>
        <Button type='primary' onClick={logout}>
          {t('BACK')}
        </Button>
      </Flex>
    );
  };

  return (
    <>
      {contextHolder}
      {render()}
    </>
  );
};
