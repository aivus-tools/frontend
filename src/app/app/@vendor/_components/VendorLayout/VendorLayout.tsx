'use client';
import { PropsWithChildren } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';
import { AppShell, useAppShell } from '@/components/layout/AppShell';
import { Profile } from '@/components/Profile/Profile';
import { Logo } from './components/Logo/Logo';
import { ProjectNavbar } from './components/ProjectNavbar/ProjectNavbar';
import { VendorNavbar } from './components/VendorNavbar/VendorNavbar';
import { GrandTotalSider } from '@/modules/vendor/sider/GrandTotalSider/GrandTotalSider';
import { DashboardSidebar } from '@/modules/vendor/dashboard/DashboardSidebar/DashboardSidebar';
import { BetaFooter, BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { PageTitleSync } from '@/components/PageTitleSync';
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

  const siderTheme = isRoot ? THEME.dark : THEME.light;
  const siderBody = isRoot ? <DashboardSidebar /> : <GrandTotalSider />;

  const headerLeft = isRoot ? (
    <div className={styles.headerLeftDashboard}>
      <span className={styles.desktopOnly}>
        <VendorNavbar />
      </span>
    </div>
  ) : (
    <ProjectNavbar />
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
        contentPaddingBottom={dismissed ? 0 : BETA_FOOTER_HEIGHT}
        footer={<BetaFooter />}
      >
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
