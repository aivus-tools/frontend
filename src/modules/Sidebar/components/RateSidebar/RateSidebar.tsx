import React from 'react';
import { SidebarBody } from './SidebarBody/SidebarBody';
import { Button, Drawer } from 'antd';
import CloseIcon from '@/icons/close-icon.svg';
import { SidebarHeader } from './SidebarHeader/SidebarHeader';
import { RateCardItem } from '@/types/rate.interface';

import styles from './RateSidebar.module.css';

interface Props {
  data: RateCardItem | null;
  isOpen: boolean;
  handleClose: () => void;
}

export const RateSidebar = ({ data, isOpen, handleClose }: Props) => {
  return (
    <Drawer
      closable={false}
      onClose={handleClose}
      open={isOpen}
      width={390}
      title={<SidebarHeader />}
      extra={<Button type='text' icon={<CloseIcon className={styles.closeButton} />} onClick={handleClose} />}
      styles={{
        header: {
          border: 'none',
        },
        body: {
          paddingTop: 0,
        },
      }}
    >
      <SidebarBody item={data} />
    </Drawer>
  );
};
