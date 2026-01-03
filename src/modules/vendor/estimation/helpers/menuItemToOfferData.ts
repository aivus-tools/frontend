import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData, UnitType, TimeUnit, QuantityUnit } from '@/types/estimation.interface';
import { KEY_SEPARATOR } from '../constants';
import { UnitOption } from '@/types/entries.interface';

const generateStringId = () => Math.floor(Math.random() * 1000000).toString();

const getUnitLabel = (unit: UnitOption) => {
  if (['Flat', 'Each'].includes(unit.name)) {
    return unit.name;
  }
  return `${unit.name} (s)`;
};

export const menuItemToOfferData = (item: MenuItem, globalDefaultUnit?: UnitOption): OfferData => {
  const temporalUnits = item.units?.temporal || [];
  const quantityUnits = item.units?.quantity || [];

  const options: OfferData['options'] = {
    [UnitType.TIME]: temporalUnits.map((unit) => ({
      label: getUnitLabel(unit),
      type: UnitType.TIME,
      value: unit.id,
      count: 1,
      isDefault: unit.isDefault,
    })),
    [UnitType.QUANTITY]: quantityUnits.map((unit) => ({
      label: getUnitLabel(unit),
      type: UnitType.QUANTITY,
      value: unit.id,
      count: 1,
      isDefault: unit.isDefault,
    })),
  };

  const defaultUnit =
    options[UnitType.TIME].find((u) => u.isDefault) ??
    options[UnitType.QUANTITY].find((u) => u.isDefault) ??
    options[UnitType.TIME][0] ??
    options[UnitType.QUANTITY][0] ??
    (globalDefaultUnit
      ? {
        label: getUnitLabel(globalDefaultUnit),
        type: globalDefaultUnit.dimension === 'TIME' ? UnitType.TIME : UnitType.QUANTITY, // Simplified
        value: globalDefaultUnit.id,
        count: 1,
      }
      : undefined);

  return {
    id: generateStringId(),
    entryId: item.key.split(KEY_SEPARATOR)[1],
    categoryId: item.key.split(KEY_SEPARATOR)[0],
    item: item.name,
    price: 0,
    units: [defaultUnit].filter(Boolean) as (TimeUnit | QuantityUnit)[],
    cost: 0,
    surcharge: 0,
    clientPrice: 0,
    clientCost: 0,
    isLinkedSurcharge: true,
    marketRange: '',
    taxRate: 0,
    taxPrice: 0,
    showTax: false,
    options,
  };
};
