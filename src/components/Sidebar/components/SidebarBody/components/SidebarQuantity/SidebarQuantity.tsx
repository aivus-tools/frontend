import React from 'react';
import { OfferData } from '@/modules/vendor/estimation/types';
import styles from './SidebarQuantity.module.css';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import { t } from '@/lib/i18n';
import { SidebarInput } from '../SidebarInput/SidebarInput';
import { ValueOf } from 'next/dist/shared/lib/constants';

interface Props {
  offer: OfferData;
  handleChange: (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

export const SidebarQuantity: React.FC<Props> = ({ offer, handleChange }) => {
  const [unit1, unit2] = offer.units;
  const options1 = unit1 && offer.options[unit1?.type].map(({ label, value }) => ({ label, value }));
  const options2 = unit2 && offer.options[unit2?.type].map(({ label, value }) => ({ label, value }));

  if (!unit1) {
    return null;
  }

  const handleChangeUnit = (value: number | null, unit: OfferData['units'][number]) => {
    if (!unit || value === unit.value) {
      return;
    }

    const newUnit = offer.options[unit.type].find((unit) => unit.value === value);

    if (!newUnit) {
      return;
    }

    const unitValue = unit.value;
    const updatedList = offer.units.map((item) => (item?.value === unitValue ? newUnit : item));

    handleChange(offer.id, 'units')(updatedList);
  };

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
        onChange={(value) => handleChangeUnit(value, unit1)}
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
          onChange={(value) => handleChangeUnit(value, unit2)}
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
