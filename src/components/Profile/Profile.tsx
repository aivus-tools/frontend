'use client';
import { ProfileProps } from './Profile.props';
import { UserOutlined } from '@ant-design/icons';
import styles from './Profile.module.css';
import cn from 'classnames';
import MovieIcon from './movie-icon.svg';
import NotificationIcon from './notification-icon.svg';
import ArrowIcon from '@/icons/arrow-icon.svg';
import { Popover } from 'react-tiny-popover';
import { useState } from 'react';
import { logout } from '@/auth/actions/logout';
import { Avatar } from 'antd';
import { useSession } from 'next-auth/react';
import { ProfileImage } from './ProfileImage';

export const Profile = ({ className, ...props }: ProfileProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const session = useSession();
  const image = session?.data?.user?.image;

  const logoutHandle = () => {
    logout();
  };

  return (
    <div className={cn(styles.profile, className)} {...props}>
      <MovieIcon className={cn(styles.icon)} />
      <NotificationIcon className={cn(styles.icon)} />
      <Popover
        isOpen={isPopoverOpen}
        positions={['bottom']}
        align='end'
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
          <Avatar icon={image ? <ProfileImage url={image} /> : <UserOutlined />} size={32} />
          <ArrowIcon />
        </div>
      </Popover>
    </div>
  );
};
