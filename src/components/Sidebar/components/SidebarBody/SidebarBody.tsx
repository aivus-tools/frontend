import { SidebarDescription } from './components/SidebarDescription/SidebarDescription';
import { OfferData } from '@/modules/vendor/estimation/types';
import React from 'react';
import { SidebarQuantity } from './components/SidebarQuantity/SidebarQuantity';
import ArrowDown from '@/icons/arrow-down.svg';
import { t } from '@/lib/i18n';

import styles from './SidebarBody.module.css';
import { Collapse } from 'antd';
import { SidebarExpenses } from './components/SidebarExpenses/SidebarExpenses';

interface Props {
  offer: OfferData | null;
}

export const SidebarBody: React.FC<Props> = ({ offer }) => {
  if (!offer) {
    return null;
  }

  const renderCollapse = (label: string, children: React.ReactNode) => {
    return (
      <div className={styles.section}>
        <Collapse
          className={styles.collapse}
          defaultActiveKey={['0']}
          expandIcon={({ isActive }) => (
            <ArrowDown className={`${styles.collapseIcon} ` + (isActive ? styles.collapseIconActive : '')} />
          )}
          ghost
          style={{ width: '100%' }}
          items={[
            {
              key: '0',
              label: <span className={styles.collapseLabel}>{label}</span>,
              children,
              classNames: { header: styles.collapseHeader },
            },
          ]}
        />
      </div>
    );
  };

  return (
    <div className={styles.content}>
      <SidebarDescription title={offer.item} />

      {renderCollapse(t('QUANTITY'), <SidebarQuantity unitList={offer.units} />)}

      {renderCollapse('Expenses', <SidebarExpenses offer={offer} />)}
    </div>
  );
};
