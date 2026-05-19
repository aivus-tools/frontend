'use client';
import { Button, Flex, message, Typography } from 'antd';

import { useSearchParams } from 'next/navigation';
import logger from '@/lib/logger';
import { PageSpinner } from '@/components/PageSpinner';
import { useSession } from 'next-auth/react';
import { GROUPS } from '@/constants/constants';
import { logout } from '@/auth/actions/logout';
import { useLazyConfirmEmailQuery, useResendConfirmationMutation } from '@/services/client/userApi';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';
import { useOnceAsync } from '@/hooks/useOnce';

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
  const email = session.data?.user?.email;
  const [messageApi, contextHolder] = message.useMessage();

  const [confirmEmail, { isLoading }] = useLazyConfirmEmailQuery();
  const [resendConfirmation, { isLoading: isResending }] = useResendConfirmationMutation();

  const handleResend = async () => {
    if (!email) {
      messageApi.error(t('EMAIL_NOT_FOUND'));
      return;
    }

    try {
      await resendConfirmation(email).unwrap();
      messageApi.success(t('EMAIL_RESENT_SUCCESS'));
    } catch (error) {
      messageApi.error(t('EMAIL_RESEND_FAILED'));
      logger.error('Failed to resend confirmation:', error);
    }
  };

  // Confirm email from URL token (once, even in Strict Mode)
  useOnceAsync(async () => {
    if (!token) return;

    try {
      await confirmEmail(token).unwrap();
      messageApi.success(t('EMAIL_CONFIRMED'));
      await session.update();
      window.location.href = AppRoute.GROUP;
    } catch (error) {
      if (errorHasMessage(error)) {
        messageApi.error(error.data.message);
      } else {
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
      logger.error('Failed to confirm email:', error);
    }
  }, [confirmEmail, messageApi, session, token]);

  const render = () => {
    if (isLoading || group !== GROUPS.unconfirmed) {
      return <PageSpinner />;
    }
    return (
      <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
        <Typography.Title level={3}>{t('PLEASE_CONFIRM_YOUR_EMAIL')}</Typography.Title>
        <Typography.Text type='secondary'>{t('EMAIL_CONFIRMATION_SENT')}</Typography.Text>
        <Flex gap={12} wrap='wrap' justify='center'>
          <Button onClick={logout}>{t('BACK')}</Button>
          <Button type='primary' onClick={handleResend} loading={isResending}>
            {t('RESEND')}
          </Button>
        </Flex>
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
