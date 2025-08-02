import React from 'react';
import { OfferData } from '@/modules/vendor/estimation/types';
import styles from './SidebarQuantity.module.css';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import { t } from '@/lib/i18n';
import { SidebarInput } from '../SidebarInput/SidebarInput';

interface Props {
  unitList: OfferData['units'];
  options: OfferData['options'];
}

export const SidebarQuantity: React.FC<Props> = ({ unitList, options }) => {
  const [unit1, unit2] = unitList;
  const options1 = unit1 && options[unit1?.type].map(({ label, value }) => ({ label, value }));
  const options2 = unit2 && options[unit2?.type].map(({ label, value }) => ({ label, value }));

  if (!unit1) {
    return null;
  }

  return (
    <div className={styles.content}>
      <SidebarInput
        type='select'
        label={`${t('UNIT')} 1`}
        value={unit1.value}
        width={115}
        options={options1}
        action={{
          icon: AddIcon,
          label: t('ADD_UNIT'),
          disabled: !!unit2,
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
          value={unit2.value}
          width={115}
          options={options2}
          action={{
            icon: RemoveIcon,
            label: t('DELETE_THIS_UNIT'),
            disabled: false,
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
