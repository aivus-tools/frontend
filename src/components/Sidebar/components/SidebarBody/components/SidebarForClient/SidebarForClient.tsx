import React from 'react';
import styles from './SidebarForClient.module.css';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { t } from '@/lib/i18n';

interface Props {
  clientPrice: number;
  clientCost: number;
}

export const SidebarForClient: React.FC<Props> = ({ clientPrice, clientCost }) => {
  return (
    <div className={styles.content}>
      <div className={styles.block}>
        <SidebarInput
          type='input'
          label={t('CLIENT_PRICE')}
          value={clientPrice}
          width={110}
          icon='$'
          // onChange?: (value: string) => void;
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
          value={clientCost}
          width={150}
          icon='$'
          disabled={true}
          // onChange?: (value: string) => void;
        />
      </div>

      <div className={styles.block}>
        <SidebarInput
          accent
          type='input'
          label={t('PROFIT')}
          bottomLabel={t('PROFIT_CALCULATION')}
          value={0}
          width={150}
          icon='$'
          disabled={true}
        />

        <SidebarInput
          accent
          bottomLabel={t('PROFIT_PERCENTAGE_CALCULATION')}
          type='input'
          value={0}
          width={110}
          icon='%'
          disabled={true}
        />
      </div>
    </div>
  );
};
