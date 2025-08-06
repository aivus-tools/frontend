import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData, UnitType } from '../types';

const generateNumeralId = () => Math.floor(Math.random() * 1000000);

export const menuItemToOfferData = (item: MenuItem): OfferData => {
  const options: OfferData['options'] = {
    [UnitType.TIME]: item.units.temporal.map((unit) => ({
      id: unit.id.toString(),
      label: unit.name,
      type: UnitType.TIME,
      value: unit.id || 1,
      count: 1,
    })),
    [UnitType.QUANTITY]: item.units.quantity.map((unit) => ({
      label: unit.name,
      type: UnitType.QUANTITY,
      value: unit.id || 1,
      count: 1,
    })),
  };

  return {
    id: generateNumeralId(),
    entryId: +item.key.split('-')[1],
    categoryId: +item.key.split('-')[0],
    item: item.name,
    price: 0,
    units: [options[UnitType.TIME][0] ?? options[UnitType.QUANTITY][0]],
    cost: 0,
    surcharge: 0,
    clientPrice: 0,
    clientCost: 0,
    marketRange: '',
    options,
  };
};
