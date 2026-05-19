'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button, Drawer, Layout, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { MenuOutlined } from '@ant-design/icons';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors } from '@/lib/themeConfig';
import { t } from '@/lib/i18n';

import styles from './AppShell.module.css';

const { Header, Content } = Layout;

export type AppShellTheme = 'light' | 'dark';

interface AppShellContextValue {
  closeDrawer: () => void;
  openDrawer: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export const useAppShell = (): AppShellContextValue => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used inside AppShell');
  }
  return context;
};

interface AppShellProps {
  children: React.ReactNode;
  sider?: React.ReactNode;
  drawer?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  contentPaddingBottom?: number;
  contentBackground?: string;
  hideSider?: boolean;
  siderTheme?: AppShellTheme;
  siderWidth?: number;
  drawerTheme?: AppShellTheme;
}

const DEFAULT_SIDER_WIDTH = 250;
const DRAWER_DARK_BG = colors.siderBg;
const DRAWER_MASK_BG = colors.siderMask;

export const AppShell = (props: AppShellProps) => {
  const { token } = theme.useToken();
  const { isMobile, ready } = useBreakpoint();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasSider = !!props.sider && !props.hideSider;
  const hasDrawer = !!props.drawer;
  const showMobileTrigger = ready && isMobile && hasDrawer;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const contextValue = useMemo<AppShellContextValue>(() => ({ openDrawer, closeDrawer }), [openDrawer, closeDrawer]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const drawerBg = props.drawerTheme === 'light' ? token.colorBgContainer : DRAWER_DARK_BG;

  return (
    <AppShellContext.Provider value={contextValue}>
      <Layout hasSider={hasSider}>
        {hasSider && (
          <Sider
            className={styles.sider}
            width={props.siderWidth ?? DEFAULT_SIDER_WIDTH}
            theme={props.siderTheme ?? 'light'}
          >
            {props.sider}
          </Sider>
        )}
        <Layout>
          <Header
            className={styles.header}
            style={{
              background: token.colorBgContainer,
              paddingInline: ready && isMobile ? 0 : 64,
            }}
          >
            <div className={styles.headerLeft}>
              {showMobileTrigger && (
                <Button
                  className={styles.menuButton}
                  type='text'
                  icon={<MenuOutlined />}
                  aria-label={t('OPEN_NAVIGATION')}
                  onClick={openDrawer}
                />
              )}
              {props.headerLeft}
            </div>
            <div className={styles.headerRight}>{props.headerRight}</div>
          </Header>
          <Content
            className={styles.content}
            style={{
              background: props.contentBackground,
              paddingBottom: props.contentPaddingBottom,
            }}
          >
            {props.children}
          </Content>
        </Layout>
        {hasDrawer && (
          <Drawer
            placement='left'
            open={drawerOpen}
            onClose={closeDrawer}
            width='min(320px, 85vw)'
            styles={{
              body: { background: drawerBg, padding: 0 },
              header: { background: drawerBg, border: 'none' },
              mask: { background: DRAWER_MASK_BG },
            }}
            closable={false}
          >
            {props.drawer}
          </Drawer>
        )}
        {props.footer}
      </Layout>
    </AppShellContext.Provider>
  );
};
