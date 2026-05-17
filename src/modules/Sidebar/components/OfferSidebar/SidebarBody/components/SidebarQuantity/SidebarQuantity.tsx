import React from 'react';
import { OfferData, UnitType } from '@/types/estimation.interface';
import styles from './SidebarQuantity.module.css';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import { t } from '@/lib/i18n';
import { SidebarInput } from '../SidebarInput/SidebarInput';
type ValueOf<T> = T[keyof T];

interface Props {
  offer: OfferData;
  handleChange: (id: string, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => void;
}

interface Option {
  label: string;
  value: string | number;
}

export const SidebarQuantity = (props: Props) => {
  const offer = props.offer;
  const handleChange = props.handleChange;
  const [unit1, unit2] = offer.units;

  if (!unit1) {
    return null;
  }

  const options1 = offer.options[unit1.type]?.map(({ label, value }) => ({ label, value }));

  const unitTypes = Object.keys(offer.options) as UnitType[];
  const [options2Name] = unitTypes.filter((name) => name !== unit1.type);

  const options2 = options2Name
    ? offer.options[options2Name]?.map(({ label, value }) => ({ label, value }))
    : undefined;

  const handleChangeUnitLabel = (
    _: string | null,
    options: Option | Option[] | undefined,
    unit: OfferData['units'][number]
  ) => {
    if (Array.isArray(options) || !options) {
      return;
    }

    const oldLabel = unit?.label;
    const newLabel = options.label;

    if (!unit || !oldLabel || !newLabel || newLabel === oldLabel) {
      return;
    }

    const newUnit = { ...unit, ...options, value: String(options.value) } as OfferData['units'][number];

    if (!newUnit) {
      return;
    }

    const unitValue = unit.value;
    const updatedList = offer.units.map((item) => (item?.value === unitValue ? newUnit : item));

    handleChange(offer.id, 'units')(updatedList);
  };

  const handleChangeUnitCount = (newValue: number | null, unit: OfferData['units'][number]) => {
    const oldValue = unit?.count;

    if (!unit || newValue == null || newValue === oldValue) {
      return;
    }

    const newUnit = { ...unit, count: newValue };

    if (!newUnit) {
      return;
    }

    const unitValue = unit.value;
    const updatedList = offer.units.map((item) => (item?.value === unitValue ? newUnit : item));

    handleChange(offer.id, 'units')(updatedList);
  };

  const handleRemoveUnit = () => {
    if (!unit2) {
      return;
    }

    handleChange(offer.id, 'units')([unit1]);
  };

  const handleAddUnit = () => {
    if (!options2 || !options2Name) {
      return;
    }

    const newUnit = offer.options[options2Name].at(0);

    if (!newUnit) {
      return;
    }

    handleChange(offer.id, 'units')([unit1, newUnit]);
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
          disabled: !!unit2 || !options2 || options2.length === 0,
          onClick: () => handleAddUnit(),
        }}
        onChange={(value, options) => handleChangeUnitLabel(value, options, unit1)}
        extraField={{
          type: 'number',
          width: 30,
          value: unit1.count,
          onChange: (value) => handleChangeUnitCount(value, unit1),
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
            onClick: () => handleRemoveUnit(),
          }}
          onChange={(value, options) => handleChangeUnitLabel(value, options, unit2)}
          extraField={{
            type: 'number',
            width: 30,
            value: unit2.count,
            onChange: (value) => handleChangeUnitCount(value, unit2),
          }}
        />
      )}
    </div>
  );
};
