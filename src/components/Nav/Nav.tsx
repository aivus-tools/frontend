'use client';
import { NavProps } from './Nav.props';
import styles from './Nav.module.css';
import cn from 'classnames';
import { Menu } from '@/interfaces/app.interface';
import { Button } from '@/components';
import { NavLink } from 'react-router-dom';

const menu: Menu[] = [
	{
		title: 'Prj details',
		route: '/projects/project',
		pathname: 'project',
	},
	{
		title: 'Estimation',
		route: '/projects/estimation',
		pathname: 'estimation',
	},
	{
		title: 'Client’s offer',
		route: '/projects/offer',
		pathname: 'offer',
	},
	{
		title: 'Timing',
		route: '/projects/timing',
		pathname: 'timing',
	},
	{
		title: 'Presentation',
		route: '/projects/presentation',
		pathname: 'presentation',
	},
	{
		title: 'Analysis',
		route: '/projects/analysis',
		pathname: 'analysis',
	},
];

export const Nav = ({ className, ...props }: NavProps) => {
	return (
		<nav className={cn(styles.nav, className)} {...props}>
			{menu.map((item: Menu, index: number) => {
				return (
					<div key={index} className={cn(styles.navItem)}>
						<NavLink to={item.route}>
							{({ isActive }) => (
								<Button size='m' color={isActive ? 'beige' : 'transparent'}>
									{item.title}
								</Button>
							)}
						</NavLink>
					</div>
				);
			})}
		</nav>
	);
};
