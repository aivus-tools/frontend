import React from 'react';
import { OfferData } from '@/modules/vendor/estimation/types';
import styles from './SidebarQuantity.module.css';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import { t } from '@/lib/i18n';
import { SidebarInput } from '../SidebarInput/SidebarInput';

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
      <SidebarInput
        type='select'
        label={`${t('UNIT')} 1`}
        value={unit1.label}
        width={115}
        options={[unit1 as never]}
        action={{
          icon: AddIcon,
          label: t('ADD_UNIT'),
          isActive: !unit2,
        }}
        // onChange?: (value: string) => void;
        extraField={{
          type: 'number',
          width: 30,
          value: unit1.count,
          // onChange?: (value: string) => void;
        }}
      />

      {unit2 && (
        <SidebarInput
          type='select'
          label={`${t('UNIT')} 2`}
          value={unit2.label}
          width={115}
          options={[unit2 as never]}
          action={{
            icon: RemoveIcon,
            label: t('DELETE_THIS_UNIT'),
            isActive: true,
          }}
          // onChange?: (value: string) => void;
          extraField={{
            type: 'number',
            width: 30,
            value: unit2.count,
            // onChange?: (value: string) => void;
          }}
        />
      )}
    </div>
  );
};
