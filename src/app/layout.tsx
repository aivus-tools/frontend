import type { Metadata } from 'next';
import StyledComponentsRegistry from './lib/registry';
import { Montserrat } from 'next/font/google';
import SessionProvider from '@/context/SessionProvider';
import './globals.css';
import { auth } from '@/auth';
import { VersionLogger } from '@/components/VersionLogger';
import fs from 'fs';
import path from 'path';

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
	const creationDate = stats.birthtime.toISOString(); // Преобразуем в строку для передачи клиенту

	return (
		<html lang='en'>
			<body className={montserrat.className}>
				<VersionLogger creationDate={creationDate} />
				<StyledComponentsRegistry>
					<SessionProvider session={session}>{children}</SessionProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
