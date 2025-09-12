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

export const RateTable = () => {
  const dispatch = useAppDispatch();
  const { data: rates = [], isLoading } = useRates();

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
      <TableCollapse label={t('PRE_PRODUCTION')} extra={<div>add item</div>} content={<></>} />
      <button onClick={() => showSidebar({} as never)}>show sidebar</button>
    </>
  );
};
