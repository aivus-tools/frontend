'use client';

import { PropsWithChildren, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useLayoutTheme } from '@/hooks/useLayoutTheme';
import { Profile } from '@/components/Profile/Profile';
import { styled } from 'styled-components';
import { ClientNavbar } from '../ClientNavbar/ClientNavbar';
import { ClientSidebar } from '../ClientSidebar/ClientSidebar';
import { ClientHomeLogo } from '../ClientHomeLogo/ClientHomeLogo';
import { getPendingBrief, clearPendingBrief } from '@/helpers/pendingBrief';
import { AppRoute } from '@/constants/appRoute';
import { BetaFooter, BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { getLocale, resetLocaleCache } from '@/lib/i18n';
import { useGetSettingsQuery } from '@/services/client/profileApi';

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

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
  flex: 1;
`;

const BriefHeaderSlot = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

const ContentLayout = styled(Content)`
  box-shadow: inset 0 5px 16.5px -11px rgb(0 0 0 / 25%);
`;

const ClientLayoutInner = ({ children }: PropsWithChildren) => {
  const theme = useLayoutTheme();
  const router = useRouter();
  const pathname = usePathname();
  const hideSider = !!pathname && /(^|\/)app\/brief\//.test(pathname);
  const checked = useRef(false);
  const { dismissed: footerDismissed } = useBetaFooter();
  const { data: userSettings } = useGetSettingsQuery();

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
      window.location.href = AppRoute.BRIEF_V2_DETAIL(pending.briefId);
    }
  }, [router]);

  return (
    <Layout hasSider={!hideSider}>
      {!hideSider && (
        <Sider style={siderStyle} width={250} theme={theme}>
          <ClientSidebar theme={theme} />
        </Sider>
      )}
      <Layout>
        <HeaderLayout style={{ padding: '0 36px' }}>
          <HeaderLeft>
            {hideSider ? (
              <>
                <ClientHomeLogo theme={theme} compact />
                <BriefHeaderSlot id='brief-header-slot' />
              </>
            ) : (
              <ClientNavbar />
            )}
          </HeaderLeft>
          <Profile />
        </HeaderLayout>
        <ContentLayout
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 70px)',
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

const ClientLayout = ({ children }: PropsWithChildren) => (
  <BetaFooterProvider>
    <ClientLayoutInner>{children}</ClientLayoutInner>
  </BetaFooterProvider>
);

export default ClientLayout;
