'use client';

import { useAppDispatch } from '@/store/hooks';
import { Rate } from '@/types/rate.interface';
import { openSidebar, setSidebarInfo } from '@/store/slices/sidebar';

export const RateTable = () => {
  const dispatch = useAppDispatch();

  const showSidebar = (rate: Rate): void => {
    dispatch(openSidebar());
    dispatch(setSidebarInfo({ type: 'rate', data: rate }));
  };

  return <button onClick={() => showSidebar({} as never)}>show sidebar</button>;
};
