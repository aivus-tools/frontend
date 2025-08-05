import React from 'react';
import styles from './SidebarForClient.module.css';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';
import { OfferData } from '@/modules/vendor/estimation/types';
import { ValueOf } from 'next/dist/shared/lib/constants';

interface Props {
  offer: OfferData;
  handleChange: (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarForClient: React.FC<Props> = ({ offer, handleChange }) => {
  const profit = offer.clientCost - offer.taxPrice;
  const percent = (profit / offer.clientCost) * 100;

  return (
    <div className={styles.content}>
      <div className={styles.block}>
        <SidebarInput
          type='input'
          label={t('CLIENT_PRICE')}
          value={offer.clientPrice}
          width={110}
          icon='$'
          onChange={handleChange(offer.id, 'clientPrice')}
          extraField={{
            type: 'double btn',
            width: [13, 13],
            value: ['↑', '↓'],
            disabled: [true, true],
            onClick: [() => {}, () => {}],
          }}
        />

        <SidebarInput
          type='input'
          label={t('CLIENT_COST')}
          value={offer.clientCost}
          width={150}
          icon='$'
          disabled={true}
        />
      </div>

      <div className={styles.block}>
        <SidebarInput
          accent
          type='input'
          label={t('PROFIT')}
          bottomLabel={t('PROFIT_CALCULATION')}
          value={profit}
          width={150}
          icon='$'
          disabled={true}
        />

        <SidebarInput
          accent
          bottomLabel={t('PROFIT_PERCENTAGE_CALCULATION')}
          type='input'
          value={percent}
          width={110}
          icon='%'
          disabled={true}
        />
      </div>
    </div>
  );
};
