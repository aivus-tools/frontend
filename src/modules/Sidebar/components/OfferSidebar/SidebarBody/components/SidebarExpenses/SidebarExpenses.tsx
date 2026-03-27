import React from 'react';
import cn from 'classnames';
import { Switch } from 'antd';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';
import { OfferData } from '@/types/estimation.interface';
import { useAppSelector } from '@/store/hooks';
import { selectOfferMetaData } from '@/store/slices/offer/selectors';
type ValueOf<T> = T[keyof T];

interface Props {
  costWithTax: number;
  offer: OfferData;
  handleChange: (id: string, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarExpenses: React.FC<Props> = (props) => {
  const metaData = useAppSelector(selectOfferMetaData);
  const globalFringes = parseFloat(metaData?.fringesPercent || '0') || 0;

  const handleChangeUnit =
    (field: 'price' | 'cost' | 'taxRate' | 'taxPrice' | 'showTax' | 'overtime') => (newValue: number | null | boolean) => {
      props.handleChange(props.offer.id, field)(newValue);
    };

  const handleFringesSwitch = () => {
    if (!props.offer.showTax) {
      props.handleChange(props.offer.id, 'taxRate')(globalFringes);
    }
    props.handleChange(props.offer.id, 'showTax')(!props.offer.showTax);
  };

  return (
    <div className={styles.content}>
      <div className={styles.block}>
        <SidebarInput
          type='input'
          label={t('ITEM_PRICE')}
          value={props.offer.price}
          width={150}
          icon='$'
          onChange={handleChangeUnit('price')}
        />

        <SidebarInput
          type='input'
          label={t('ITEM_COST')}
          value={props.offer.cost}
          width={150}
          icon='$'
          disabled={true}
          onChange={handleChangeUnit('cost')}
        />
      </div>

      <div className={styles.block}>
        <SidebarInput
          type='input'
          label='Overtime'
          value={props.offer.overtime}
          width={150}
          icon='$'
          onChange={handleChangeUnit('overtime')}
        />
      </div>

      <div className={cn(styles.block, styles.fees)}>
        <div className={styles.feesSwitch}>
          <Switch size='small' checked={props.offer.showTax} onClick={handleFringesSwitch} />
          <div className={styles.feesLabel}>Custom fringes</div>
        </div>

        <SidebarInput
          type='input'
          label='Fringes Rate'
          labelPositon='left'
          value={props.offer.showTax ? props.offer.taxRate : globalFringes}
          width={70}
          disabled={!props.offer.showTax}
          icon='%'
          onChange={handleChangeUnit('taxRate')}
        />
      </div>

      {props.offer.showTax && (
        <div className={styles.block}>
          <SidebarInput
            type='input'
            label='Price with Fringes'
            value={props.offer.taxPrice}
            width={150}
            icon='$'
            disabled={true}
            onChange={handleChangeUnit('taxPrice')}
          />

          <SidebarInput
            type='input'
            label='Cost with Fringes'
            value={props.costWithTax}
            width={150}
            icon='$'
            disabled={true}
          />
        </div>
      )}
    </div>
  );
};
