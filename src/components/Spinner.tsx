import { Spin } from 'antd';

export default function Spinner() {
	return (
		<div
			style={{
				display: 'flex',
				width: '100%',
				height: 'calc(100vh - 70px)',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Spin spinning />
		</div>
	);
}
