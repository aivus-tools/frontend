import React from 'react';
// import { ValueOf } from 'next/dist/shared/lib/constants';
//
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { RootState } from '@/store/store';

import { Rate } from '@/types/rate.interface';

import styles from './SidebarBody.module.css';

interface Props {
  initialRateData: Rate | null;
}

export const SidebarBody: React.FC<Props> = () => {
  // const dispatch = useAppDispatch();
  // const offer = useAppSelector((state: RootState) => selectOfferById(state, initialRateData?.id ?? -1));
  //
  // if (!offer) {
  //   return null;
  // }
  //
  // const handleChange = (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => {
  //   dispatch(changeOfferRow({ id, [key]: data }));
  // };

  return <div className={styles.content}></div>;
};
