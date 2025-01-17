import type { Metadata } from 'next';
import StyledComponentsRegistry from './lib/registry';
import { Montserrat } from 'next/font/google';
import SessionProvider from '@/context/SessionProvider';
import './globals.css';
import { auth } from '@/auth';

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

	return (
		<html lang='en'>
			<body className={montserrat.className}>
				<StyledComponentsRegistry>
					<SessionProvider session={session}>{children}</SessionProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
