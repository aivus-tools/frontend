import React from 'react';
import { OfferData } from '@/modules/vendor/estimation/types';
import { SidebarBody } from '@/modules/Sidebar/components/OfferSideber/SidebarBody/SidebarBody';

interface Props {
  data: OfferData | null;
}

export const OfferSidebar = ({ data }: Props) => {
  return <SidebarBody initialOfferData={data} />;
};
