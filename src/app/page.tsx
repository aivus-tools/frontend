import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
	const session = await auth();
	console.log('session', session);
	if (session) {
		redirect('/app/dashboard');
	} else {
		redirect('/auth');
	}
}
