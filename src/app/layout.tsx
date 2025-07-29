import type { Metadata } from 'next';
import Script from 'next/script';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import StyledComponentsRegistry from '@/app/_componnets/StyledComponentsRegistry';
import { Montserrat } from 'next/font/google';
import SessionProvider from '@/context/SessionProvider';
import './globals.css';
import { auth } from '@/auth/auth';
import { VersionLogger } from '@/components/VersionLogger';
import fs from 'fs';
import path from 'path';
import theme from '@/lib/themeConfig';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aivus Web',
  description: 'Aivus Web',
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

  return (
    <html lang='en'>
      <body className={montserrat.className}>
        <VersionLogger creationDate={creationDate} />
        <StyledComponentsRegistry>
          <AntdRegistry>
            <ConfigProvider theme={theme}>
              <SessionProvider session={session}>{children}</SessionProvider>
            </ConfigProvider>
          </AntdRegistry>
        </StyledComponentsRegistry>
      </body>
      <Script id='resize-iframe' strategy='afterInteractive'>
        {`
					function resizeIframe() {
						const height = document.body.scrollHeight;
						parent.postMessage({ type: 'resize', height: height }, '*');
					}

					window.addEventListener('load', resizeIframe);
					window.addEventListener('resize', resizeIframe);
				`}
      </Script>
    </html>
  );
}
