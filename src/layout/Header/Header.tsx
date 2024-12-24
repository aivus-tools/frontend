import { HeaderProps } from './Header.props';
import styles from './Header.module.css';
import cn from 'classnames';
import { Nav, Profile, Button } from '@/components';

export const Header = ({ className, hideNavigation = false, ...props }: HeaderProps) => {
	return (
		<header className={cn(styles.header, className)} {...props}>
			{!hideNavigation && <Nav />}
			<div className={cn(styles.share)}>
				<Button size='m' color='primary'>
					{hideNavigation ? 'New Estimation' : 'Share'}
				</Button>
			</div>
			<Profile />
		</header>
	);
};
