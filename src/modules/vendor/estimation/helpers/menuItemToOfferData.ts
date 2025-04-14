import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData, UnitType } from '../types';

const generateNumeralId = () => Math.floor(Math.random() * 1000000);

export const menuItemToOfferData = (item: MenuItem): OfferData => {
	return {
		id: generateNumeralId(),
		entryId: +item.key.split('-')[1],
		categoryId: +item.key.split('-')[0],
		item: item.name,
		price: 0,
		units: [{ id: 'seconds', label: 'seconds', type: UnitType.TIME, value: 1 }],
		cost: 0,
		surcharge: 0,
		clientPrice: 0,
		clientCost: 0,
		marketRange: '',
	};
};
