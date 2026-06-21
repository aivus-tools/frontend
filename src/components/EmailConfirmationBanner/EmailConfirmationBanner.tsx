'use client';

import { Alert, Button, message } from 'antd';
import { useSession } from 'next-auth/react';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';
import { useResendConfirmationMutation } from '@/services/client/userApi';

export const EmailConfirmationBanner = () => {
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [resendConfirmation, { isLoading }] = useResendConfirmationMutation();

  const email = session?.user?.email;
  const emailConfirmedAt = session?.user?.emailConfirmedAt;

  // Nag only when explicitly unconfirmed (null). `undefined` means unknown — a
  // pre-deploy JWT lacking the field — and must not produce a false nag for an
  // already-confirmed user, so a strict `=== null` check is intentional here.
  if (!email || emailConfirmedAt !== null) {
    return null;
  }

  const handleResend = async () => {
    try {
      await resendConfirmation(email).unwrap();
      messageApi.success(t('EMAIL_RESENT_SUCCESS'));
    } catch (error) {
      messageApi.error(t('EMAIL_RESEND_FAILED'));
      logger.error('Failed to resend confirmation:', error);
    }
  };

  return (
    <>
      {contextHolder}
      <Alert
        type='warning'
        banner
        message={t('EMAIL_NOT_CONFIRMED_BANNER')}
        action={
          <Button size='small' type='link' onClick={handleResend} loading={isLoading}>
            {t('RESEND')}
          </Button>
        }
      />
    </>
  );
};
