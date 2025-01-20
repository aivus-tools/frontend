import { logout } from '@/app/actions/logout';
import { Button } from 'antd';

export default async function Page() {
	return (
		<div>
			<Button onClick={logout}>Logout</Button>
		</div>
	);
}
