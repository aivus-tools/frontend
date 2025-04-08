import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData, UnitType } from '../types';

const generateNumeralId = () => Math.floor(Math.random() * 1000000);

export const menuItemToOfferData = (item: MenuItem): OfferData => {
	return {
		id: generateNumeralId(),
		entryId: +item.key.split('-')[1],
		categoryId: +item.key.split('-')[0],
		item: item.name,
		price: null,
		units: [{ id: 'seconds', label: 'seconds', type: UnitType.TIME, value: 0 }],
		cost: null,
		surcharge: '',
		clientPrice: null,
		clientCost: null,
		marketRange: '',
	};
};
