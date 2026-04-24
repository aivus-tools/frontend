'use client';
import { PropsWithChildren } from 'react';
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Logo } from './components/Logo/Logo';
import { useLayoutTheme } from '@/hooks/useLayoutTheme';
import { Profile } from '@/components/Profile/Profile';
import { styled } from 'styled-components';
import { useSelectedLayoutSegments } from 'next/navigation';
import { ProjectNavbar } from './components/ProjectNavbar/ProjectNavbar';
import { VendorNavbar } from './components/VendorNavbar/VendorNavbar';
import { GrandTotalSider } from '@/modules/vendor/sider/GrandTotalSider/GrandTotalSider';
import { DashboardSidebar } from '@/modules/vendor/dashboard/DashboardSidebar/DashboardSidebar';
import { BetaFooter, BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';

const { Header, Content } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  position: 'sticky',
  height: '100vh',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const HeaderLayout = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const ContentLayout = styled(Content)`
  box-shadow: inset 0 5px 16.5px -11px rgb(0 0 0 / 25%);
`;

const VendorLayoutInner = ({ children }: PropsWithChildren) => {
  const theme = useLayoutTheme();
  const segments = useSelectedLayoutSegments();
  const isRoot = segments.length === 1;
  const { dismissed: footerDismissed } = useBetaFooter();

  return (
    <Layout hasSider>
      <Sider style={siderStyle} width={250} theme={theme}>
        <Logo theme={theme} />
        {isRoot ? <DashboardSidebar /> : <GrandTotalSider />}
      </Sider>
      <Layout>
        <HeaderLayout style={{ padding: '0 36px' }}>
          {isRoot ? <VendorNavbar /> : <ProjectNavbar />}
          <Profile />
        </HeaderLayout>
        <ContentLayout
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 70px)',
            backgroundColor: isRoot ? undefined : 'var(--bg-gray-page)',
            paddingBottom: footerDismissed ? 0 : BETA_FOOTER_HEIGHT,
          }}
        >
          {children}
        </ContentLayout>
      </Layout>
      <BetaFooter />
    </Layout>
  );
};

const VendorLayout = ({ children }: PropsWithChildren) => (
  <BetaFooterProvider>
    <VendorLayoutInner>{children}</VendorLayoutInner>
  </BetaFooterProvider>
);

export default VendorLayout;
