'use client';

import React from 'react';
import { Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeSidebar, selectIsSidebarOpen, selectSidebarData, selectSidebarType } from '@/store/slices/sidebar';
import { OfferSidebar } from '@/modules/Sidebar/components/OfferSideber/OfferSidebar';

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
          <OfferSidebar data={data} />
        </Drawer>
      );
    case 'rate': {
      return (
        <Drawer onClose={handleClose} open={isOpen} width={390}>
          {/*<SidebarBody initialOfferData={data} />*/}
        </Drawer>
      );
    }
    default:
      return null;
  }
};
