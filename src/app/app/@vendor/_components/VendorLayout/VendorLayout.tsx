'use client';
import { PropsWithChildren } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';
import { AppShell, useAppShell } from '@/components/layout/AppShell';
import { Profile } from '@/components/Profile/Profile';
import { Logo } from './components/Logo/Logo';
import { ProjectNavbar } from './components/ProjectNavbar/ProjectNavbar';
import { ProjectTabs } from './components/ProjectNavbar/components/ProjectTabs/ProjectTabs';
import { VendorNavbar } from './components/VendorNavbar/VendorNavbar';
import { GrandTotalSider } from '@/modules/vendor/sider/GrandTotalSider/GrandTotalSider';
import {
  GrandTotalMobileBar,
  GRAND_TOTAL_MOBILE_BAR_HEIGHT,
} from '@/modules/vendor/sider/GrandTotalSider/GrandTotalMobileBar';
import { DashboardSidebar } from '@/modules/vendor/dashboard/DashboardSidebar/DashboardSidebar';
import { BetaFooter, useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { PageTitleSync } from '@/components/PageTitleSync';
import { EmailConfirmationBanner } from '@/components/EmailConfirmationBanner/EmailConfirmationBanner';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { THEME } from '@/constants/constants';

import styles from './VendorLayout.module.css';

const MobileSidebar = (props: { isRoot: boolean }) => {
  const { closeDrawer } = useAppShell();
  return (
    <div className={styles.mobileSidebar}>
      <Logo theme={THEME.dark} />
      {props.isRoot && <VendorNavbar variant='mobile' onNavigate={closeDrawer} />}
      <DashboardSidebar />
    </div>
  );
};

const VendorLayoutInner = (props: PropsWithChildren) => {
  const segments = useSelectedLayoutSegments();
  const isRoot = segments.length === 1;
  const { dismissed } = useBetaFooter();
  const betaFooterHeight = useBetaFooterHeight();
  const { isMobile, ready } = useBreakpoint();

  const showMobileBar = ready && isMobile && !isRoot;
  const mobileBarOffset = showMobileBar ? GRAND_TOTAL_MOBILE_BAR_HEIGHT : 0;

  const siderTheme = isRoot ? THEME.dark : THEME.light;
  const siderBody = isRoot ? <DashboardSidebar /> : <GrandTotalSider />;

  const headerLeft = isRoot ? (
    <div className={styles.headerLeftDashboard}>
      <span className={styles.desktopOnly}>
        <VendorNavbar />
      </span>
    </div>
  ) : (
    <>
      <span className={styles.desktopOnly}>
        <ProjectNavbar variant='desktop' />
      </span>
      <span className={styles.mobileOnly}>
        <ProjectNavbar variant='mobile' />
      </span>
    </>
  );

  return (
    <>
      <PageTitleSync />
      <AppShell
        sider={
          <>
            <Logo theme={siderTheme} />
            {siderBody}
          </>
        }
        drawer={<MobileSidebar isRoot={isRoot} />}
        siderTheme={siderTheme}
        headerLeft={headerLeft}
        headerRight={<Profile />}
        contentBackground={isRoot ? undefined : 'var(--bg-gray-page)'}
        contentPaddingBottom={(dismissed ? 0 : betaFooterHeight) + mobileBarOffset}
        footer={
          <>
            <BetaFooter />
            {!isRoot && <GrandTotalMobileBar />}
          </>
        }
      >
        {!isRoot && (
          <div className={styles.mobileProjectTabsBar}>
            <ProjectTabs fullWidth />
          </div>
        )}
        <EmailConfirmationBanner />
        {props.children}
      </AppShell>
    </>
  );
};

const VendorLayout = (props: PropsWithChildren) => (
  <BetaFooterProvider>
    <VendorLayoutInner>{props.children}</VendorLayoutInner>
  </BetaFooterProvider>
);

export default VendorLayout;
