import React from 'react';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '@/components/Sidebar/components/SidebarBody/components/SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';
import { OfferData } from '@/modules/vendor/estimation/types';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { Switch } from 'antd';
import cn from 'classnames';

interface Props {
  offer: OfferData;
  handleChange: (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarExpenses: React.FC<Props> = ({ offer, handleChange }) => {
  const [isTaxOn, setIsTaxOn] = React.useState(true);

  const handleChangeUnit = (newValue: number | null, field: 'price' | 'cost') => {
    handleChange(offer.id, field)(newValue);
  };

  return (
    <div className={styles.content}>
      <div className={styles.block}>
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

      <div className={cn(styles.block, styles.fees)}>
        <div className={styles.feesSwitch}>
          <Switch size='small' defaultChecked onClick={setIsTaxOn} />

          <div className={styles.feesLabel}>{t('TAXES_AND_FEES')}</div>
        </div>

        <SidebarInput
          type='input'
          label={t('TAX_RATE')}
          labelPositon='left'
          value={0}
          width={70}
          disabled={!isTaxOn}
          icon='%'
          onChange={(value) => handleChange(offer.id, 'surcharge')(value)}
        />
      </div>

      <div className={styles.block}>
        <SidebarInput
          type='input'
          label={t('ITEM_PRICE_TAX_INCL')}
          value={offer.clientPrice}
          width={110}
          icon='$'
          disabled={!isTaxOn}
          onChange={(value) => handleChange(offer.id, 'clientPrice')(value)}
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
          label={t('ITEM_COST_TAX_INCL')}
          value={offer.clientCost}
          width={150}
          icon='$'
          disabled={!isTaxOn}
        />
      </div>
    </div>
  );
};
