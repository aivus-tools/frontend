'use client';
import { ProfileProps } from './Profile.props';
import styles from './Profile.module.css';
import cn from 'classnames';
import MovieIcon from './movie-icon.svg';
import NotificationIcon from './notification-icon.svg';
import ArrowIcon from './arrow-icon.svg';


export const Profile = ({children, className, ...props }: ProfileProps) => {
	return (
		<div className={cn(styles.profile)}>
			<MovieIcon className={cn(styles.icon)} />
			<NotificationIcon className={cn(styles.icon)} />
			<div className={styles.user}>
				<div className={styles.userpic}></div>
				<ArrowIcon />
			</div>
		</div>
	);
};
