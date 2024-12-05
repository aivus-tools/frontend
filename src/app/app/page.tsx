import { AppNoSSR } from '@/spa';
import { cookies } from 'next/headers';
export default async function Home() {
	const userType = (await cookies()).get('session')?.value;

	return (
		<main>
			<AppNoSSR
				user={{
					id: 'userId',
					type: userType as 'vendor' | 'client',
				}}
			/>
		</main>
	);
}
