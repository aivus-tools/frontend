'use client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { VendorTabs } from './vendor-tabs';

export const VendorNavbar = () => {
	const router = useRouter();

	useEffect(() => {
		router.prefetch(`/app/dashboard/new-brief/details`);
	}, [router]);

	const handleNewEstimation = () => {
		router.push(`/app/dashboard/new-brief/details`);
	};

	return (
		<div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<VendorTabs />
			<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
				<Button type='primary' onClick={handleNewEstimation}>
					New Estimation
				</Button>
			</div>
		</div>
	);
};
