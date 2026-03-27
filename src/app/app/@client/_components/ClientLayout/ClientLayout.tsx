'use client';

import { PropsWithChildren } from 'react';
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useLayoutTheme } from '@/hooks/useLayoutTheme';
import { Profile } from '@/components/Profile/Profile';
import { styled } from 'styled-components';
import { ClientNavbar } from '../ClientNavbar/ClientNavbar';
import { ClientSidebar } from '../ClientSidebar/ClientSidebar';

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

const ClientLayout = ({ children }: PropsWithChildren) => {
  const theme = useLayoutTheme();

  return (
    <Layout hasSider>
      <Sider style={siderStyle} width={250} theme={theme}>
        <ClientSidebar theme={theme} />
      </Sider>
      <Layout>
        <HeaderLayout style={{ padding: '0 36px' }}>
          <ClientNavbar />
          <Profile />
        </HeaderLayout>
        <ContentLayout
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 70px)',
          }}
        >
          {children}
        </ContentLayout>
      </Layout>
    </Layout>
  );
};

export default ClientLayout;
