import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData, UnitType } from '@/types/estimation.interface';
import { KEY_SEPARATOR } from '../constants';

const generateStringId = () => Math.floor(Math.random() * 1000000).toString();

export const menuItemToOfferData = (item: MenuItem): OfferData => {
  const temporalUnits = item.units?.temporal || [];
  const quantityUnits = item.units?.quantity || [];

  const options: OfferData['options'] = {
    [UnitType.TIME]: temporalUnits.map((unit) => ({
      label: `${unit.name} (${unit.symbol})`,
      type: UnitType.TIME,
      value: unit.id,
      count: 1,
    })),
    [UnitType.QUANTITY]: quantityUnits.map((unit) => ({
      label: `${unit.name} (${unit.symbol})`,
      type: UnitType.QUANTITY,
      value: unit.id,
      count: 1,
    })),
  };

  return {
    id: generateStringId(),
    entryId: item.key.split(KEY_SEPARATOR)[1],
    categoryId: item.key.split(KEY_SEPARATOR)[0],
    item: item.name,
    price: 0,
    units: [options[UnitType.TIME][0] ?? options[UnitType.QUANTITY][0]],
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
