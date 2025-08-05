'use client';

import React from 'react';
import { Button, Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeSidebar, selectIsSidebarOpen, selectSidebarData, selectSidebarType } from '@/store/slices/sidebar';
import { SidebarBody } from './components/SidebarBody/SidebarBody';
import { SidebarHeader } from '@/components/Sidebar/components/SidebarHeader/SidebarHeader';
import CloseIcon from '@/icons/close-icon.svg';

import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(selectIsSidebarOpen);
  const type = useAppSelector(selectSidebarType);
  const data = useAppSelector(selectSidebarData);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  switch (type) {
    case 'offer':
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
    default:
      return null;
  }
};
