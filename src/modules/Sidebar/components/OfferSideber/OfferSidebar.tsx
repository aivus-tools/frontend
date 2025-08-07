import React from 'react';
import { OfferData } from '@/modules/vendor/estimation/types';
import { SidebarBody } from '@/modules/Sidebar/components/OfferSideber/SidebarBody/SidebarBody';
import { Button, Drawer } from 'antd';
import CloseIcon from '@/icons/close-icon.svg';
import { SidebarHeader } from '@/modules/Sidebar/components/OfferSideber/SidebarHeader/SidebarHeader';

import styles from './OfferSidebar.module.css';

interface Props {
  data: OfferData | null;
  isOpen: boolean;
  handleClose: () => void;
}

export const OfferSidebar = ({ data, isOpen, handleClose }: Props) => {
  return (
    <Drawer
      closable={false}
      onClose={handleClose}
      open={isOpen}
      width={360}
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
      <SidebarBody initialOfferData={data} />
    </Drawer>
  );
};
