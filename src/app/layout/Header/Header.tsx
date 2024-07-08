import { HeaderProps } from './Header.props';
import styles from './Header.module.css';
import cn from 'classnames';
import { Nav, Profile, Button } from '@/app/components';

export const Header = ({ children, className, ...props }: HeaderProps) => {
	return (
		<header className={cn(styles.header, className)} {...props}>
			<Nav />
			<div className={cn(styles.share)}>
				<Button size="m" color="primary">
					Share
				</Button>
			</div>

			<Profile />
		</header>
	);
};
