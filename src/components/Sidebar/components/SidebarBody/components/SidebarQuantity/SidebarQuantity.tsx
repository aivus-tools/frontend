import React from 'react';
import { OfferData } from '@/modules/vendor/estimation/types';
import styles from './SidebarQuantity.module.css';

interface Props {
  unitList: OfferData['units'];
}

export const SidebarQuantity: React.FC<Props> = ({ unitList }) => {
  const [unit1, unit2] = unitList;

  if (!unit1) {
    return null;
  }

  return (
    <div className={styles.content}>
      <div>Unit 1</div>
      {unit2 && <div>Unit 2</div>}
    </div>
  );
};
