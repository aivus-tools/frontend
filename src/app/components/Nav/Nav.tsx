'use client';
import { NavProps } from './Nav.props';
import styles from './Nav.module.css';
import cn from 'classnames';
import { usePathname } from 'next/navigation';
import { menu } from '@/app/interfaces/app.interface';
import { Button } from '@/app/components';
import Link from 'next/link';


export const Nav = ({children, className, ...props }: NavProps) => {
	const menu: menu[] = [
		{
			title: 'Prj details',
			route: '/project',
			pathname: 'project',
		},
		{
			title: 'Estimation',
			route: '/estimation',
			pathname: 'estimation',
		},
		{
			title: 'Client’s offer',
			route: '/offer',
			pathname: 'offer',
		},
		{
			title: 'Timing',
			route: '/timing',
			pathname: 'timing',
		},
		{
			title: 'Presentation',
			route: '/presentation',
			pathname: 'presentation',
		},
		{
			title: 'Analysis',
			route: '/analysis',
			pathname: 'analysis',
		}
	];

	const pathname = usePathname();
	return (
		<nav
			className={cn(styles.nav, className)}
			{...props}
		>
			{menu.map((item: menu, index: number) => {
				return (
					<div key={index}
							className={cn(styles.navItem)}
					>
						<Link href={item.route}>
							<Button size="m" color={pathname.includes(item.pathname) ? 'beige' : 'transparent'}>
								{item.title}
							</Button>
						</Link>
					</div>
				);
			})}
		</nav>
);
};
