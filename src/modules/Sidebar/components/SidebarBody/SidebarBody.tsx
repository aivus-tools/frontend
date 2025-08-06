import { SidebarDescription } from './components/SidebarDescription/SidebarDescription';
import { OfferData } from '@/modules/vendor/estimation/types';
import React from 'react';
import { SidebarQuantity } from './components/SidebarQuantity/SidebarQuantity';
import { t } from '@/lib/i18n';
import { SidebarExpenses } from './components/SidebarExpenses/SidebarExpenses';
import { SidebarForClient } from './components/SidebarForClient/SidebarForClient';
import { SidebarInput } from './components/SidebarInput/SidebarInput';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { changeOfferRow } from '@/store/slices/offer/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOfferById } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { SidebarCollapse } from './components/SidebarCollapse/SidebarCollapse';

import styles from './SidebarBody.module.css';

interface Props {
  initialOfferData: OfferData | null;
}

export const SidebarBody: React.FC<Props> = ({ initialOfferData }) => {
  const dispatch = useAppDispatch();
  const offer = useAppSelector((state: RootState) => selectOfferById(state, initialOfferData?.id ?? -1));

  if (!offer) {
    return null;
  }

  const handleChange = (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => {
    dispatch(changeOfferRow({ id, [key]: data }));
  };

  return (
    <div className={styles.content}>
      <SidebarDescription title={offer.item} />

      <div className={styles.section}>
        <SidebarCollapse
          label={t('QUANTITY')}
          content={<SidebarQuantity offer={offer} handleChange={handleChange} />}
        />
      </div>

      <div className={styles.section}>
        <SidebarCollapse
          label={t('EXPENSES')}
          content={<SidebarExpenses offer={offer} handleChange={handleChange} />}
        />
      </div>

      <div className={styles.section}>
        <SidebarCollapse
          label={t('FOR_CLIENT')}
          content={<SidebarForClient offer={offer} handleChange={handleChange} />}
          extra={
            <SidebarInput
              type='input'
              label={t('MARKUP')}
              labelPositon='left'
              value={offer.surcharge}
              width={70}
              icon='%'
              onChange={(value) => handleChange(offer.id, 'surcharge')(value)}
            />
          }
        />
      </div>
    </div>
  );
};
