'use client';
import { ProfileProps } from './Profile.props';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import styles from './Profile.module.css';
import cn from 'classnames';
import { t } from '@/lib/i18n';
import ArrowIcon from '@/icons/arrow-icon.svg';
import { Popover } from 'react-tiny-popover';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Avatar } from 'antd';
import { ProfileImage } from './ProfileImage';
import { AppRoute } from '@/constants/appRoute';
import { useGetProfileQuery } from '@/services/client/profileApi';

export const Profile = ({ className, ...props }: ProfileProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { data: profileData } = useGetProfileQuery();
  const session = useSession();
  const image = profileData?.avatar_url || session?.data?.user?.image;

  const logoutHandle = () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    signOut({ callbackUrl: AppRoute.AUTH });
  };

  const navigateTo = (path: string) => {
    setIsPopoverOpen(false);
    router.push(path);
  };

  return (
    <div className={cn(styles.profile, className)} {...props}>
      <Popover
        isOpen={isPopoverOpen}
        positions={['bottom']}
        align='end'
        padding={8}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={() => (
          <div className={cn(styles.popover)}>
            <div className={cn(styles.menuItem)} onClick={() => navigateTo(AppRoute.PROFILE)}>
              {t('PROFILE')}
            </div>
            <div className={cn(styles.menuItem)} onClick={() => navigateTo(AppRoute.SETTINGS)}>
              {t('SETTINGS')}
            </div>
            <div className={cn(styles.divider)} />
            <div className={cn(styles.menuItem, { [styles.menuItemDisabled]: isLoggingOut })} onClick={logoutHandle}>
              {isLoggingOut ? <LoadingOutlined className={styles.menuItemIcon} /> : null}
              {t('LOGOUT')}
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
