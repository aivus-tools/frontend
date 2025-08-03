'use client';

import React from 'react';
import { Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeSidebar, selectIsSidebarOpen, selectSidebarData, selectSidebarType } from '@/store/slices/sidebar';
import { SidebarBody } from './components/SidebarBody/SidebarBody';

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
        <Drawer onClose={handleClose} open={isOpen} width={360}>
          <SidebarBody initialOfferData={data} />
        </Drawer>
      );
    default:
      return null;
  }
};
