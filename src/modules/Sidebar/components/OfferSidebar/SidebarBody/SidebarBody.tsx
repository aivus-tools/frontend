import { OfferData } from '@/types/estimation.interface';
import React from 'react';
import { t } from '@/lib/i18n';
type ValueOf<T> = T[keyof T];
import { changeOfferRow } from '@/store/slices/offer/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOfferById } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { SidebarCollapse } from './components/SidebarCollapse/SidebarCollapse';
import { SidebarDescription } from './components/SidebarDescription/SidebarDescription';
import { SidebarQuantity } from './components/SidebarQuantity/SidebarQuantity';
import { SidebarExpenses } from './components/SidebarExpenses/SidebarExpenses';
import { SidebarForClient } from './components/SidebarForClient/SidebarForClient';
import { SidebarInput } from './components/SidebarInput/SidebarInput';

import styles from './SidebarBody.module.css';

interface Props {
  initialOfferData: OfferData | null;
}

export const SidebarBody: React.FC<Props> = ({ initialOfferData }) => {
  const dispatch = useAppDispatch();
  const offer = useAppSelector((state: RootState) => selectOfferById(state, initialOfferData?.id ?? ''));

  if (!offer) {
    return null;
  }

  const handleChange = (id: string, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => {
    dispatch(changeOfferRow({ id, [key]: data }));
  };

  const costWithTax = offer.cost;

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
          content={<SidebarExpenses offer={offer} handleChange={handleChange} costWithTax={costWithTax} />}
        />
      </div>

      <div className={styles.section}>
        <SidebarCollapse
          label={t('FOR_CLIENT')}
          content={<SidebarForClient offer={offer} handleChange={handleChange} costWithTax={costWithTax} />}
          extra={
            <SidebarInput
              type='input'
              label={t('MARKUP')}
              labelPositon='left'
              value={offer.surcharge}
              width={70}
              icon='%'
              onChange={handleChange(offer.id, 'surcharge')}
            />
          }
        />
      </div>
    </div>
  );
};
