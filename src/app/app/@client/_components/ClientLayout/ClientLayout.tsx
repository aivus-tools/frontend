'use client';

import { PropsWithChildren, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useLayoutTheme } from '@/hooks/useLayoutTheme';
import { AppShell, useAppShell } from '@/components/layout/AppShell';
import { Profile } from '@/components/Profile/Profile';
import { ClientNavbar } from '../ClientNavbar/ClientNavbar';
import { ClientSidebar } from '../ClientSidebar/ClientSidebar';
import { ClientHomeLogo } from '../ClientHomeLogo/ClientHomeLogo';
import { getPendingBrief, clearPendingBrief } from '@/helpers/pendingBrief';
import { AppRoute } from '@/constants/appRoute';
import { BetaFooter, useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { PageTitleSync } from '@/components/PageTitleSync';
import { EmailConfirmationBanner } from '@/components/EmailConfirmationBanner/EmailConfirmationBanner';
import { getLocale, resetLocaleCache, t } from '@/lib/i18n';
import { useGetSettingsQuery } from '@/services/client/profileApi';
import { THEME } from '@/constants/constants';

import styles from './ClientLayout.module.css';

const MobileSidebar = () => {
  const { closeDrawer } = useAppShell();
  return <ClientSidebar theme={THEME.dark} variant='mobile' onNavigate={closeDrawer} />;
};

const ClientLayoutInner = (props: PropsWithChildren) => {
  const theme = useLayoutTheme();
  const router = useRouter();
  const pathname = usePathname();
  const hideSider = !!pathname && /(^|\/)app\/brief\//.test(pathname);
  const checked = useRef(false);
  const { dismissed: footerDismissed } = useBetaFooter();
  const { data: userSettings } = useGetSettingsQuery();
  const footerHeight = useBetaFooterHeight();

  useEffect(() => {
    if (!userSettings?.language) {
      return;
    }
    const settingsLocale = userSettings.language === 'ru' ? 'ru' : 'en';
    if (settingsLocale === getLocale()) {
      return;
    }
    document.cookie = `locale=${settingsLocale};path=/;max-age=31536000`;
    resetLocaleCache();
    window.location.reload();
  }, [userSettings?.language]);

  useEffect(() => {
    if (checked.current) {
      return;
    }
    checked.current = true;
    const pending = getPendingBrief();
    if (pending) {
      clearPendingBrief();
      router.replace(`${AppRoute.BRIEF_CLAIM(pending.briefId)}?token=${encodeURIComponent(pending.token)}`);
    }
  }, [router]);

  const goBackToDashboard = () => {
    router.push(AppRoute.DASHBOARD);
  };

  const headerLeft = hideSider ? (
    <div className={styles.headerLeftBrief}>
      <span className={styles.mobileOnly}>
        <Button
          className={styles.backButton}
          type='text'
          icon={<ArrowLeftOutlined />}
          aria-label={t('BACK')}
          onClick={goBackToDashboard}
        />
      </span>
      <ClientHomeLogo theme={THEME.light} compact />
      <div id='brief-header-slot' className={styles.briefHeaderSlot} />
    </div>
  ) : (
    <div className={styles.headerLeftDashboard}>
      <span className={styles.mobileOnly}>
        <ClientHomeLogo theme={THEME.light} compact />
      </span>
      <span className={styles.desktopOnly}>
        <ClientNavbar />
      </span>
    </div>
  );

  return (
    <>
      <PageTitleSync />
      <AppShell
        sider={<ClientSidebar theme={theme} />}
        drawer={<MobileSidebar />}
        hideSider={hideSider}
        siderTheme={theme}
        headerLeft={headerLeft}
        headerRight={<Profile />}
        contentPaddingBottom={footerDismissed ? 0 : footerHeight}
        footer={<BetaFooter />}
      >
        <EmailConfirmationBanner />
        {props.children}
      </AppShell>
    </>
  );
};

const ClientLayout = (props: PropsWithChildren) => (
  <BetaFooterProvider>
    <ClientLayoutInner>{props.children}</ClientLayoutInner>
  </BetaFooterProvider>
);

export default ClientLayout;
