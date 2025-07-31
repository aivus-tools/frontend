'use client';

import React from 'react';
import { Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeSidebar, selectIsSidebarOpen, selectSidebarContent, selectSidebarTitle } from '@/store/slices/sidebar';

export const Sidebar = () => {
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(selectIsSidebarOpen);
  const title = useAppSelector(selectSidebarTitle);
  const content = useAppSelector(selectSidebarContent);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  return (
    <Drawer title={title} onClose={handleClose} open={isOpen}>
      {content}
    </Drawer>
  );
};
