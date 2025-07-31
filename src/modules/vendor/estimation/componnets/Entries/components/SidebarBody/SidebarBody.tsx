import { SidebarDescription } from './components/SidebarDescription/SidebarDescription';
import { OfferData } from '@/modules/vendor/estimation/types';
import React from 'react';
import { SidebarQuantity } from './components/SidebarQuantity/SidebarQuantity';
import ArrowDown from '@/icons/arrow-down.svg';

import styles from './SidebarBody.module.css';
import { Collapse } from 'antd';

interface Props {
  offer: OfferData;
}

export const SidebarBody: React.FC<Props> = ({ offer }) => {
  const renderCollapse = (label: string, children: React.ReactNode) => {
    return (
      <div className={styles.section}>
        <Collapse
          defaultActiveKey={['0']}
          expandIcon={({ isActive }) => (
            <ArrowDown className={`${styles.collapseIcon} ` + (isActive ? styles.collapseIconActive : '')} />
          )}
          ghost
          items={[
            {
              key: '0',
              label: <span className={styles.collapseLabel}>{label}</span>,
              children,
              classNames: { header: styles.collapse },
            },
          ]}
        />
      </div>
    );
  };

  return (
    <div className={styles.content}>
      <SidebarDescription title={offer.item} />

      {renderCollapse('Quantity', <SidebarQuantity unitList={offer.units} />)}
    </div>
  );
};
