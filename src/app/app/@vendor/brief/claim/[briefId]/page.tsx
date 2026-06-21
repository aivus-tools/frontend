'use client';

import { useRouter } from 'next/navigation';
import { Button, Result, Space } from 'antd';
import { AppRoute } from '@/constants/appRoute';
import { logout } from '@/auth/actions/logout';
import { t } from '@/lib/i18n';

const VendorBriefClaimPage = () => {
  const router = useRouter();

  return (
    <Result
      status='info'
      title={t('BRIEF_CLAIM_VENDOR_TITLE')}
      subTitle={t('BRIEF_CLAIM_VENDOR')}
      extra={
        <Space wrap>
          <Button type='primary' onClick={() => logout()}>
            {t('LOGOUT')}
          </Button>
          <Button onClick={() => router.replace(AppRoute.DASHBOARD)}>{t('GO_TO_DASHBOARD')}</Button>
        </Space>
      }
    />
  );
};

export default VendorBriefClaimPage;
