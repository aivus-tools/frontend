import React from 'react';
import { OfferData, QuantityUnit, TimeUnit } from '@/modules/vendor/estimation/types';
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

  const handleChangeUnit = (newValue: number | null, unit: OfferData['units'][number], field: 'count' | 'type') => {
    const oldValue = unit?.[field];

    if (!unit || !oldValue || !newValue || newValue === oldValue) {
      return;
    }

    const newUnit: TimeUnit | QuantityUnit | undefined =
      field === 'type'
        ? offer.options[unit.type].find((unit) => unit.value === newValue)
        : { ...unit, [field]: newValue };

    if (!newUnit) {
      return;
    }

    const unitValue = unit.value;
    const updatedList = offer.units.map((item) => (item?.value === unitValue ? newUnit : item));

    handleChange(offer.id, 'units')(updatedList);
  };

  const handleRemoveUnit = (unitToDelete: OfferData['units'][number]) => {
    const updatedList = offer.units?.filter((unit) => unit?.value !== unitToDelete?.value) ?? [];
    handleChange(offer.id, 'units')(updatedList);
  };

  const handleAddUnit = (newUnit: OfferData['units'][number]) => {
    handleChange(offer.id, 'units')([...offer.units, newUnit]);
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
          onClick: () => handleAddUnit(unit1),
        }}
        onChange={(value) => handleChangeUnit(value, unit1, 'type')}
        extraField={{
          type: 'number',
          width: 30,
          value: unit1.count,
          onChange: (value) => handleChangeUnit(value, unit1, 'count'),
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
            onClick: () => handleRemoveUnit(unit2),
          }}
          onChange={(value) => handleChangeUnit(value, unit2, 'type')}
          extraField={{
            type: 'number',
            width: 30,
            value: unit2.count,
            onChange: (value) => handleChangeUnit(value, unit2, 'count'),
          }}
        />
      )}
    </div>
  );
};
