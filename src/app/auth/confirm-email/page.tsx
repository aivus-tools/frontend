'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Flex, Typography, Button, message } from 'antd';
import { PageSpinner } from '@/components/PageSpinner';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useSession, signOut } from 'next-auth/react';
import { clearPendingBrief } from '@/helpers/pendingBrief';
import { GROUPS } from '@/constants/constants';
import { isDifferentUser } from '@/lib/confirmEmail';

const CONFIRM_DELAY_MS = 1500;

type ConfirmState = 'idle' | 'pending' | 'success' | 'error';

const ConfirmEmailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const [status, setStatus] = useState<ConfirmState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [hasStartedConfirmation, setHasStartedConfirmation] = useState(false);

  const token = useMemo(() => searchParams.get('token'), [searchParams]);
  useEffect(() => {
    // Wait until session loads and token is available
    if (!token || sessionStatus === 'loading' || hasStartedConfirmation) {
      return;
    }

    const runConfirmation = async () => {
      setHasStartedConfirmation(true);
      try {
        setStatus('pending');
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(`/service/auth/confirm-email?token=${encodedToken}`, {
          method: 'GET',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errMsg = data?.error ?? t('EMAIL_CONFIRMATION_FAILED');
          throw new Error(errMsg);
        }

        if (isDifferentUser(session?.user?.email, data.email)) {
          if (data.claimedBriefId) {
            clearPendingBrief();
          }
          messageApi.info(t('EMAIL_CONFIRMED_OTHER_ACCOUNT'));
          setStatus('success');
          await new Promise((x) => setTimeout(x, CONFIRM_DELAY_MS));
          await signOut({ callbackUrl: AppRoute.AUTH });
          return;
        }

        messageApi.success(t('EMAIL_CONFIRMED'));
        setStatus('success');

        if (session?.user) {
          await updateSession({
            user: {
              ...session.user,
              group: data.group,
              clientId: data.clientId,
              emailConfirmedAt: data.emailConfirmedAt,
            },
          });

          await new Promise((x) => setTimeout(x, CONFIRM_DELAY_MS));

          // The brief was already claimed and the role assigned at registration,
          // so confirming just lands the user back in the app. claimedBriefId is
          // only returned for legacy accounts that claimed on confirm.
          if (data.claimedBriefId) {
            clearPendingBrief();
            window.location.href = AppRoute.BRIEF_DETAIL(data.claimedBriefId);
          } else if (data.group === GROUPS.client || data.group === GROUPS.vendor) {
            window.location.href = AppRoute.DASHBOARD;
          } else {
            window.location.href = AppRoute.GROUP;
          }
        } else {
          // User is not logged in - wait and redirect to auth
          await new Promise((resolve) => setTimeout(resolve, CONFIRM_DELAY_MS));
          router.replace(AppRoute.AUTH);
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : t('EMAIL_CONFIRMATION_FAILED');
        setErrorMessage(errMsg);
        setStatus('error');
        messageApi.error(errMsg);
      }
    };

    runConfirmation();
  }, [token, sessionStatus, session?.user, updateSession, router, messageApi, hasStartedConfirmation]);

  const handleBackToAuth = () => {
    router.replace(AppRoute.AUTH);
  };

  const renderContent = () => {
    if (status === 'pending' || status === 'idle') {
      return (
        <Flex
          align='center'
          justify='center'
          vertical
          gap={16}
          style={{ minHeight: '100dvh', width: '100%', padding: '16px' }}
        >
          <PageSpinner />
          <Typography.Text type='secondary'>{t('EMAIL_CONFIRMATION_PROCESSING')}</Typography.Text>
        </Flex>
      );
    }

    if (status === 'success') {
      return (
        <Flex
          align='center'
          justify='center'
          vertical
          gap={16}
          style={{ minHeight: '100dvh', width: '100%', padding: '16px' }}
        >
          <Typography.Title level={3}>{t('EMAIL_CONFIRMED')}</Typography.Title>
          <Typography.Text type='secondary'>
            {session?.user ? t('EMAIL_CONFIRMED_REDIRECT') : t('EMAIL_CONFIRMED_LOGIN')}
          </Typography.Text>
          <Button type='primary' onClick={handleBackToAuth}>
            {session?.user ? t('GO_TO_DASHBOARD') : t('GO_TO_LOGIN')}
          </Button>
        </Flex>
      );
    }

    return (
      <Flex
        align='center'
        justify='center'
        vertical
        gap={16}
        style={{ minHeight: '100dvh', width: '100%', padding: '16px' }}
      >
        <Typography.Title level={3}>{t('EMAIL_CONFIRMATION_FAILED_TITLE')}</Typography.Title>
        <Typography.Text type='danger'>{errorMessage ?? t('EMAIL_CONFIRMATION_FAILED')}</Typography.Text>
        <Flex gap={12}>
          <Button onClick={handleBackToAuth}>{t('BACK')}</Button>
          <Button type='primary' onClick={() => router.refresh()}>
            {t('TRY_AGAIN')}
          </Button>
        </Flex>
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

export default ConfirmEmailPage;
