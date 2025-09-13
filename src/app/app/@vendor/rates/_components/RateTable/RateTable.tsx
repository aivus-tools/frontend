'use client';

import { useAppDispatch } from '@/store/hooks';
import { Rate } from '@/types/rate.interface';
import { openSidebar, setSidebarInfo } from '@/store/slices/sidebar';
import { Header } from './components/Header/Header';
import { TableCollapse } from './components/Collapse/Collapse';
import { t } from '@/lib/i18n';
import { useRates } from '@/hooks/useRates';
import Spinner from '@/components/Spinner';
import React from 'react';
import { Content } from '@/app/app/@vendor/rates/_components/RateTable/components/Content/Content';

export const fakeData: Rate[] = [
  {
    id: 1,
    name: 'Standard',
    description: 'Basic rate for common tasks',
    vendorId: 101,
    entryId: 1001,
    basePrice: 1000,
    totalPrice: 1200,
    options: JSON.stringify([
      { name: 'Urgency', description: 'Delivery within 24 hours', type: 'percentage', value: 20 },
      { name: 'Warranty', description: 'Extended warranty', type: 'fixed', value: 50 },
    ]),
    isCustom: false,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-03-10T08:30:00Z',
    vendor: {
      id: 101,
      name: 'Acme Corp',
      ownerId: 77,
      createdAt: '2024-12-10T09:00:00Z',
      updatedAt: '2025-03-01T12:00:00Z',
    },
    entry: {
      id: 1001,
      name: 'Brochure printing',
      description: 'Up to 1000 copies',
      categoryRef: {
        id: 10,
        name: 'Printing',
        level: 1,
        createdAt: '2024-10-15T08:00:00Z',
        parentCategoryId: 1,
      },
    },
  },
  {
    id: 2,
    name: 'Custom',
    description: 'Tailored rate for a specific request',
    vendorId: 102,
    basePrice: 0,
    totalPrice: 0,
    options: JSON.stringify([]),
    isCustom: true,
    createdAt: '2025-02-01T11:20:00Z',
    updatedAt: '2025-02-15T14:45:00Z',
    vendor: {
      id: 102,
      name: 'John Doe LLC',
      ownerId: 88,
      createdAt: '2024-11-05T10:10:00Z',
      updatedAt: '2025-02-10T16:00:00Z',
    },
  },
];

export const RateTable = () => {
  const dispatch = useAppDispatch();
  const { data: rates = fakeData, isLoading } = useRates();

  const showSidebar = (rate: Rate): void => {
    dispatch(openSidebar());
    dispatch(setSidebarInfo({ type: 'rate', data: rate }));
  };

  console.log(rates);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Header />
      <TableCollapse label={t('PRE_PRODUCTION')} extra={<div>add item</div>} content={<Content rates={rates} />} />
      <button onClick={() => showSidebar({} as never)}>show sidebar</button>
    </>
  );
};
