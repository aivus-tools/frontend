import React from 'react';
import styles from './SidebarForClient.module.css';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';
import { OfferData } from '@/types/estimation.interface';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { round } from '@/lib/utils';

interface Props {
  costWithTax: number;
  offer: OfferData;
  handleChange: (id: string, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarForClient: React.FC<Props> = ({ costWithTax, offer, handleChange }) => {
  const profit = round(offer.clientCost - costWithTax);
  const percent = round((profit / offer.clientCost) * 100);

  return (
    <div className={styles.content}>
      <div className={styles.block}>
        <SidebarInput
          type='input'
          label={t('CLIENT_PRICE')}
          value={offer.clientPrice}
          width={150}
          icon='$'
          onChange={handleChange(offer.id, 'clientPrice')}
          // extraField={{
          //   type: 'double btn',
          //   width: [13, 13],
          //   value: ['↑', '↓'],
          //   disabled: [true, true],
          //   onClick: [() => {}, () => {}],
          // }}
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
          label={t('MARGIN')}
          bottomLabel={t('PROFIT_PERCENTAGE_CALCULATION')}
          type='input'
          value={percent}
          width={150}
          icon='%'
          disabled={true}
        />

        <SidebarInput
          accent
          type='input'
          label={t('PROFIT')}
          bottomLabel={offer.showTax ? t('PROFIT_CALCULATION_WITH_TAX') : t('PROFIT_CALCULATION')}
          value={profit}
          width={150}
          icon='$'
          disabled={true}
        />
      </div>
    </div>
  );
};
