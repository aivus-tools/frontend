import React from 'react';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';
import { OfferData } from '@/modules/vendor/estimation/types';
import { ValueOf } from 'next/dist/shared/lib/constants';

interface Props {
  offer: OfferData;
  handleChange: (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarExpenses: React.FC<Props> = ({ offer, handleChange }) => {
  const handleChangeUnit = (newValue: number | null, field: 'price' | 'cost') => {
    handleChange(offer.id, field)(newValue);
  };

  return (
    <div className={styles.content}>
      <SidebarInput
        type='input'
        label={t('ITEM_PRICE')}
        value={offer.price}
        width={110}
        icon='$'
        onChange={(value) => handleChangeUnit(value, 'price')}
        extraField={{
          type: 'single btn',
          width: 30,
          value: '←$',
          disabled: true,
          onClick: () => {},
        }}
      />

      <SidebarInput
        type='input'
        label={t('ITEM_COST')}
        value={offer.cost}
        width={150}
        icon='$'
        disabled={true}
        onChange={(value) => handleChangeUnit(value, 'cost')}
      />
    </div>
  );
};
