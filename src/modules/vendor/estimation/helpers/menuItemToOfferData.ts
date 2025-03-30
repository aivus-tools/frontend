import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData } from '../types';

const generateNumeralId = () => Math.floor(Math.random() * 1000000);

export const menuItemToOfferData = (item: MenuItem): OfferData => {
	return {
		id: generateNumeralId(),
		entryId: +item.key.split('-')[1],
		categoryId: +item.key.split('-')[0],
		item: item.name,
		price: null,
		units: '',
		quantity: null,
		cost: null,
		surcharge: '',
		clientPrice: null,
		clientCost: null,
		marketRange: '',
	};
};
