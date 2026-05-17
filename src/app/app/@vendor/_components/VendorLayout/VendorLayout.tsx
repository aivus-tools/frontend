'use client';
import { PropsWithChildren } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
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

const VendorLayoutInner = (props: PropsWithChildren) => {
  const segments = useSelectedLayoutSegments();
  const isRoot = segments.length === 1;
  const { dismissed } = useBetaFooter();

  const siderTheme = isRoot ? THEME.dark : THEME.light;
  const siderBody = isRoot ? <DashboardSidebar /> : <GrandTotalSider />;

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
        drawer={
          <>
            <Logo theme={THEME.dark} />
            <DashboardSidebar />
          </>
        }
        siderTheme={siderTheme}
        headerLeft={isRoot ? <VendorNavbar /> : <ProjectNavbar />}
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
