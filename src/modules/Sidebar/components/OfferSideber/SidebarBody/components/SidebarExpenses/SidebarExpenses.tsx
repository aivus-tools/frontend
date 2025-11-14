import React from 'react';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';
import { OfferData } from '@/types/estimation.interface';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { Switch } from 'antd';
import cn from 'classnames';

interface Props {
  costWithTax: number;
  offer: OfferData;
  handleChange: (id: string, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarExpenses: React.FC<Props> = ({ costWithTax, offer, handleChange }) => {
  const handleChangeUnit =
    (field: 'price' | 'cost' | 'taxRate' | 'taxPrice' | 'showTax') => (newValue: number | null | boolean) => {
      handleChange(offer.id, field)(newValue);
    };

  const handleTaxSwitch = (value: boolean) => {
    handleChangeUnit('showTax')(value);
  };

  return (
    <div className={styles.content}>
      <div className={styles.block}>
        <SidebarInput
          type='input'
          label={t('ITEM_PRICE')}
          value={offer.price}
          width={150}
          icon='$'
          onChange={handleChangeUnit('price')}
          // extraField={{
          //   type: 'single btn',
          //   width: 30,
          //   value: '←$',
          //   disabled: true,
          //   onClick: () => {},
          // }}
        />

        <SidebarInput
          type='input'
          label={t('ITEM_COST')}
          value={offer.cost}
          width={150}
          icon='$'
          disabled={true}
          onChange={handleChangeUnit('cost')}
        />
      </div>

      <div className={cn(styles.block, styles.fees)}>
        <div className={styles.feesSwitch}>
          <Switch size='small' checked={offer.showTax} onClick={handleTaxSwitch} />

          <div className={styles.feesLabel}>{t('TAXES_AND_FEES')}</div>
        </div>

        <SidebarInput
          type='input'
          label={t('TAX_RATE')}
          labelPositon='left'
          value={offer.taxRate}
          width={70}
          disabled={!offer.showTax}
          icon='%'
          onChange={handleChangeUnit('taxRate')}
        />
      </div>

      {offer.showTax && (
        <div className={styles.block}>
          <SidebarInput
            type='input'
            label={t('ITEM_PRICE_TAX_INCL')}
            value={offer.taxPrice}
            width={150}
            icon='$'
            disabled={!offer.showTax}
            onChange={handleChangeUnit('taxPrice')}
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
            label={t('ITEM_COST_TAX_INCL')}
            value={costWithTax}
            width={150}
            icon='$'
            disabled={true}
          />
        </div>
      )}
    </div>
  );
};
