'use client';
import { useRouter } from 'next/navigation';

import { NavProps } from './Nav.props';
import styles from './Nav.module.css';
import cn from 'classnames';
import { Menu } from '@/interfaces/app.interface';
import { Button } from '@/components';
import { usePageParams } from '@/hooks/usePageParams';

const menu: Menu[] = [
	{
		title: 'Prj details',
		pathname: 'details',
	},
	{
		title: 'Estimation',
		pathname: 'estimation',
	},
	{
		title: 'Client’s offer',
		pathname: 'offer',
	},
	{
		title: 'Timing',
		pathname: 'timing',
	},
	{
		title: 'Presentation',
		pathname: 'presentation',
	},
	{
		title: 'Analysis',
		pathname: 'analysis',
	},
];

export const Nav = ({ className, ...props }: NavProps) => {
	const router = useRouter();
	const { tab } = usePageParams();

	const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		router.push(pathname);
	};

	return (
		<nav className={cn(styles.nav, className)} {...props}>
			{menu.map((item: Menu, index: number) => {
				const isActive = item.pathname === tab;
				return (
					<div key={index} className={cn(styles.navItem)}>
						<Button size='m' color={isActive ? 'beige' : 'transparent'} onClick={handleClick(item.pathname)}>
							{item.title}
						</Button>
					</div>
				);
			})}
		</nav>
	);
};
