'use client';
import { ProfileProps } from './Profile.props';
import styles from './Profile.module.css';
import cn from 'classnames';
import MovieIcon from './movie-icon.svg';
import NotificationIcon from './notification-icon.svg';
import ArrowIcon from './arrow-icon.svg';
import { Popover } from 'react-tiny-popover';
import { useState } from 'react';

export const Profile = ({ className, ...props }: ProfileProps) => {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const logoutHandle = (): void => {
		window.open('/auth', '_self');
	};

	return (
		<div className={cn(styles.profile, className)} {...props}>
			<MovieIcon className={cn(styles.icon)} />
			<NotificationIcon className={cn(styles.icon)} />

			<Popover
				isOpen={isPopoverOpen}
				positions={['bottom']}
				align='center'
				padding={8}
				onClickOutside={() => setIsPopoverOpen(false)}
				content={() => (
					<div className={cn(styles.popover)}>
						<div className={cn(styles.logout)} onClick={logoutHandle}>
							Logout
						</div>
					</div>
				)}
			>
				<div className={styles.user} onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
					<div className={styles.userpic}></div>
					<ArrowIcon />
				</div>
			</Popover>
		</div>
	);
};
