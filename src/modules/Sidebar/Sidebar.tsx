'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeSidebar, selectIsSidebarOpen, selectSidebarInfo } from '@/store/slices/sidebar';
import { OfferSidebar } from '@/modules/Sidebar/components/OfferSidebar/OfferSidebar';
import { RateSidebar } from '@/modules/Sidebar/components/RateSidebar/RateSidebar';

export const Sidebar = () => {
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(selectIsSidebarOpen);
  const info = useAppSelector(selectSidebarInfo);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  switch (info?.type) {
    case 'offer':
      return <OfferSidebar data={info.data} isOpen={isOpen} handleClose={handleClose} />;
    case 'rate': {
      return <RateSidebar data={info.data} isOpen={isOpen} handleClose={handleClose} />;
    }
    default:
      return null;
  }
};
