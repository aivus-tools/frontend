'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Drawer, Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { useLayoutTheme } from '@/hooks/useLayoutTheme';
import { Profile } from '@/components/Profile/Profile';
import { styled } from 'styled-components';
import { ClientNavbar } from '../ClientNavbar/ClientNavbar';
import { ClientSidebar } from '../ClientSidebar/ClientSidebar';
import { ClientHomeLogo } from '../ClientHomeLogo/ClientHomeLogo';
import { getPendingBrief, clearPendingBrief } from '@/helpers/pendingBrief';
import { AppRoute } from '@/constants/appRoute';
import { BetaFooter, useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';
import { getLocale, resetLocaleCache, t } from '@/lib/i18n';
import { useGetSettingsQuery } from '@/services/client/profileApi';
import { media } from '@/styles/breakpoints';

const { Header, Content } = Layout;

const SiderStyled = styled(Sider)`
  overflow: auto;
  position: sticky !important;
  height: 100vh;
  inset-inline-start: 0;
  top: 0;
  bottom: 0;
  scrollbar-width: thin;
  scrollbar-gutter: stable;

  ${media.mobile} {
    display: none !important;
    flex: 0 !important;
    max-width: 0 !important;
    min-width: 0 !important;
    width: 0 !important;
  }
`;

const HeaderLayout = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 36px;
  height: 70px;
  line-height: 70px;

  ${media.mobile} {
    padding: 0 12px;
    height: 56px;
    line-height: 56px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
  flex: 1;

  ${media.mobile} {
    gap: 8px;
  }
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

const DesktopOnly = styled.div`
  display: contents;

  ${media.mobile} {
    display: none;
  }
`;

const MobileOnly = styled.div`
  display: none;

  ${media.mobile} {
    display: inline-flex;
  }
`;

const IconButton = styled(Button)`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  & .anticon {
    font-size: 20px;
    color: var(--main);
  }
`;

const drawerBodyStyle: React.CSSProperties = {
  background: '#121b3e',
  padding: 0,
};

const drawerHeaderStyle: React.CSSProperties = {
  background: '#121b3e',
  border: 'none',
};

const ClientLayoutInner = ({ children }: PropsWithChildren) => {
  const theme = useLayoutTheme();
  const router = useRouter();
  const pathname = usePathname();
  const hideSider = !!pathname && /(^|\/)app\/brief\//.test(pathname);
  const checked = useRef(false);
  const { dismissed: footerDismissed } = useBetaFooter();
  const { data: userSettings } = useGetSettingsQuery();
  const footerHeight = useBetaFooterHeight();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const goBackToDashboard = () => {
    router.push(AppRoute.DASHBOARD);
  };

  return (
    <Layout hasSider={!hideSider}>
      {!hideSider && (
        <SiderStyled width={250} theme={theme}>
          <ClientSidebar theme={theme} />
        </SiderStyled>
      )}
      <Layout>
        <HeaderLayout>
          <HeaderLeft>
            {hideSider ? (
              <>
                <MobileOnly>
                  <IconButton
                    type='text'
                    icon={<ArrowLeftOutlined />}
                    aria-label={t('BACK')}
                    onClick={goBackToDashboard}
                  />
                </MobileOnly>
                <ClientHomeLogo theme={theme} compact />
                <BriefHeaderSlot id='brief-header-slot' />
              </>
            ) : (
              <>
                <MobileOnly>
                  <IconButton
                    type='text'
                    icon={<MenuOutlined />}
                    aria-label={t('OPEN_NAVIGATION')}
                    onClick={() => setDrawerOpen(true)}
                  />
                  <ClientHomeLogo theme={theme} compact />
                </MobileOnly>
                <DesktopOnly>
                  <ClientNavbar />
                </DesktopOnly>
              </>
            )}
          </HeaderLeft>
          <Profile />
        </HeaderLayout>
        <ContentLayout
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100dvh - var(--aivus-header-h))',
            paddingBottom: footerDismissed ? 0 : footerHeight,
          }}
        >
          {children}
        </ContentLayout>
      </Layout>
      <Drawer
        placement='left'
        open={drawerOpen}
        onClose={closeDrawer}
        width='min(320px, 85vw)'
        styles={{ body: drawerBodyStyle, header: drawerHeaderStyle, mask: { background: 'rgba(18, 27, 62, 0.55)' } }}
        closable={false}
        destroyOnClose={false}
      >
        <ClientSidebar theme='dark' variant='mobile' onNavigate={closeDrawer} />
      </Drawer>
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
