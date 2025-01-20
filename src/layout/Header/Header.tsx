'use client';
import { HeaderProps } from './Header.props';
import styles from './Header.module.css';
import cn from 'classnames';
import { Nav, Profile, Button } from '@/components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export const Header = ({ className, hideNavigation = false, ...props }: HeaderProps) => {
	const router = useRouter();
	useEffect(() => {
		router.prefetch(`/app/dashboard/new-brief/details`);
	}, [router]);
	return (
		<header className={cn(styles.header, className)} {...props}>
			{!hideNavigation && <Nav />}
			<div className={cn(styles.share)}>
				<Button
					size='m'
					color='primary'
					onClick={() => hideNavigation && router.push(`/app/dashboard/new-brief/details`)}
				>
					{hideNavigation ? 'New Estimation' : 'Share'}
				</Button>
			</div>
			<Profile />
		</header>
	);
};
