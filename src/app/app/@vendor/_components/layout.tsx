'use client';
import { PropsWithChildren } from 'react';
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Logo } from './Logo';
import { useLayoutTheme } from '@/hooks/useLayoutTheme';
import { Profile } from '@/components/Profile/Profile';
import { styled } from 'styled-components';
import { useSelectedLayoutSegments } from 'next/navigation';
import { ProjectNavbar } from './project-navbar';
import { VendorNavbar } from './vendor-navbar';
import { GrandTotalSider } from '@/modules/vendor/estimation/GrandTotalSider';

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

const VendorLayout = ({ children }: PropsWithChildren) => {
  const theme = useLayoutTheme();
  const segments = useSelectedLayoutSegments();
  const isRoot = segments.length === 1;

  return (
    <Layout hasSider>
      <Sider style={siderStyle} width={250} theme={theme}>
        <Logo theme={theme} />
        {!isRoot && <GrandTotalSider />}
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
          }}
        >
          {children}
        </ContentLayout>
      </Layout>
    </Layout>
  );
};

export default VendorLayout;
