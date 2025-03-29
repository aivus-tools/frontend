import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData } from '../types';

const generateNumeralId = () => Math.floor(Math.random() * 1000000);

export const menuItemToOfferData = (item: MenuItem): OfferData => {
	return {
		id: generateNumeralId(),
		entryId: +item.key.split('-')[1],
		categoryId: +item.key.split('-')[0],
		item: item.name,
		price: 0,
		units: '',
		quantity: 0,
		cost: 0,
		surcharge: '',
		clientPrice: 0,
		clientCost: 0,
		marketRange: '',
	};
};
