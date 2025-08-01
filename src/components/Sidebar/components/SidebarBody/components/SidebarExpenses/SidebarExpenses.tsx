import React from 'react';
import styles from './SidebarExpenses.module.css';
import { SidebarInput } from '@/components/Sidebar/components/SidebarBody/components/SidebarInput/SidebarInput';
import { OfferData } from '@/modules/vendor/estimation/types';

interface Props {
  offer: OfferData | null;
}

export const SidebarExpenses: React.FC<Props> = () => {
  return (
    <div className={styles.content}>
      <SidebarInput
        type='input'
        label='Item Price'
        value={'35.0'}
        width={110}
        icon='$'
        // onChange?: (value: string) => void;
        extraField={{
          type: 'single btn',
          width: 30,
          value: '←$',
          // onChange?: (value: string) => void;
        }}
      />

      <SidebarInput
        type='input'
        label='Item Cost'
        value={'840.0'}
        width={150}
        icon='$'
        // onChange?: (value: string) => void;
      />
    </div>
  );
};
