import React from 'react';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '@/components/Sidebar/components/SidebarBody/components/SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';

interface Props {
  price: number;
  cost: number;
}

export const SidebarExpenses: React.FC<Props> = ({ price, cost }) => {
  return (
    <div className={styles.content}>
      <SidebarInput
        type='input'
        label={t('ITEM_PRICE')}
        value={price}
        width={110}
        icon='$'
        // onChange?: (value: string) => void;
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
        value={cost}
        width={150}
        icon='$'
        // onChange?: (value: string) => void;
      />
    </div>
  );
};
