'use client';
import { ProfileProps } from './Profile.props';
import { UserOutlined } from '@ant-design/icons';
import styles from './Profile.module.css';
import cn from 'classnames';
import { t } from '@/lib/i18n';
import ArrowIcon from '@/icons/arrow-icon.svg';
import { Popover } from 'react-tiny-popover';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/auth/actions/logout';
import { Avatar } from 'antd';
import { useSession } from 'next-auth/react';
import { ProfileImage } from './ProfileImage';
import { AppRoute } from '@/constants/appRoute';

export const Profile = ({ className, ...props }: ProfileProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();
  const session = useSession();
  const image = session?.data?.user?.image;

  const logoutHandle = () => {
    logout();
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
            <div className={cn(styles.menuItem)} onClick={logoutHandle}>
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
