'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Flex, Typography, Button, message } from 'antd';
import Spinner from '@/components/Spinner';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';
import { useSession } from 'next-auth/react';
import { useOnceAsync } from '@/hooks/useOnce';

const CONFIRM_DELAY_MS = 1500;

type ConfirmState = 'idle' | 'pending' | 'success' | 'error';

const ConfirmEmailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [status, setStatus] = useState<ConfirmState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  // Проверка токена (синхронная)
  useEffect(() => {
    if (!token) {
      setStatus('error');
      const msg = t('INVALID_TOKEN');
      setErrorMessage(msg);
      messageApi.error(msg);
    }
  }, [token, messageApi]);

  // Подтверждение email (один раз, даже в Strict Mode)
  useOnceAsync(async () => {
    if (!token) return;

    try {
      setStatus('pending');
      // Кодируем токен для безопасной передачи в URL
      const encodedToken = encodeURIComponent(token);
      const response = await fetch(`/service/auth/confirm-email?token=${encodedToken}`, {
        method: 'GET',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errMsg = data?.error ?? t('EMAIL_CONFIRMATION_FAILED');
        throw new Error(errMsg);
      }

      messageApi.success(t('EMAIL_CONFIRMED'));
      setStatus('success');

      if (session?.user) {
        // Пользователь залогинен - обновляем сессию
        await updateSession();
        
        // Ждём, чтобы NextAuth записал cookie
        await new Promise((resolve) => setTimeout(resolve, CONFIRM_DELAY_MS));
        
        // Используем window.location для полной перезагрузки со свежей сессией
        window.location.href = AppRoute.GROUP;
      } else {
        // Пользователь не залогинен - ждём и редиректим на auth
        await new Promise((resolve) => setTimeout(resolve, CONFIRM_DELAY_MS));
        router.replace(AppRoute.AUTH);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : t('EMAIL_CONFIRMATION_FAILED');
      setErrorMessage(errMsg);
      setStatus('error');
      messageApi.error(errMsg);
    }
  }, [token, session?.user, updateSession, router, messageApi]);

  const handleBackToAuth = () => {
    router.replace(AppRoute.AUTH);
  };

  const renderContent = () => {
    if (status === 'pending' || status === 'idle') {
      return (
        <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
          <Spinner />
          <Typography.Text type='secondary'>{t('EMAIL_CONFIRMATION_PROCESSING')}</Typography.Text>
        </Flex>
      );
    }

    if (status === 'success') {
      return (
        <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
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
      <Flex align='center' justify='center' vertical gap={16} style={{ height: '100vh', width: '100%' }}>
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
