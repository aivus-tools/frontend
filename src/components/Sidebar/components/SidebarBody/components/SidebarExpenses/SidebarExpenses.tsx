import React from 'react';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '@/components/Sidebar/components/SidebarBody/components/SidebarInput/SidebarInput';
import { OfferData } from '@/modules/vendor/estimation/types';
import { t } from '@/lib/i18n';

interface Props {
  offer: OfferData | null;
}

export const SidebarExpenses: React.FC<Props> = () => {
  return (
    <div className={styles.content}>
      <SidebarInput
        type='input'
        label={t('ITEM_PRICE')}
        value={10}
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
        value={10}
        width={150}
        icon='$'
        // onChange?: (value: string) => void;
      />
    </div>
  );
};
