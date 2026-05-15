import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import StyledComponentsRegistry from '@/app/_components/StyledComponentsRegistry';
import { Montserrat } from 'next/font/google';
import SessionProvider from '@/context/SessionProvider';
import './globals.css';
import { auth } from '@/auth/auth';
import { VersionLogger } from '@/components/VersionLogger';
import fs from 'fs';
import path from 'path';
import theme from '@/lib/themeConfig';
import React from 'react';
import { headers } from 'next/headers';
import { setServerLocale } from '@/lib/serverLocale';
import type { LocaleKey } from '@/locales';
import { AntdAppProvider } from '@/app/_components/AntdAppProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aivus Web',
  description: 'Aivus Web',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  const stats = fs.statSync(packageJsonPath);
  const creationDate = stats.birthtime.toISOString();

  const headersList = await headers();
  const headerLocale = headersList.get('x-locale');
  const envLocale = process.env.NEXT_PUBLIC_LOCALE;
  const resolvedLocale: LocaleKey =
    headerLocale === 'ru' || headerLocale === 'en'
      ? headerLocale
      : envLocale === 'ru' || envLocale === 'en'
        ? (envLocale as LocaleKey)
        : 'en';
  setServerLocale(resolvedLocale);

  return (
    <html lang={resolvedLocale} suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <VersionLogger creationDate={creationDate} />
        <StyledComponentsRegistry>
          <AntdRegistry>
            <ConfigProvider theme={theme}>
              <AntdAppProvider>
                <SessionProvider session={session}>{children}</SessionProvider>
              </AntdAppProvider>
            </ConfigProvider>
          </AntdRegistry>
        </StyledComponentsRegistry>
      </body>
      <Script id='resize-iframe' strategy='afterInteractive'>
        {`
          function resizeIframe() {
            const height = document.body.scrollHeight;
            parent.postMessage({ type: 'resize', height: height }, window.location.origin);
          }

          window.addEventListener('load', resizeIframe);
          window.addEventListener('resize', resizeIframe);
        `}
      </Script>
    </html>
  );
}
