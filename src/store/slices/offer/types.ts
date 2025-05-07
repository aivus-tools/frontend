import { Category, Entry, OfferData } from '@/modules/vendor/estimation/types';
import { Offer } from '@/types/offer';

export interface UnforeseenExpenses {
	percent: number;
	clientPercent: number;
	isVisible: boolean;
}

export interface OfferDetails {
	offers: OfferData[];
	categories: Category[];
	subCategories: Category[];
	categorySurcharge: Record<
		number,
		{
			surcharge: number;
			linked: boolean;
		}
	>;
	unforeseenExpenses: UnforeseenExpenses;
	showCostPerVideo: boolean;
}

export interface OfferState {
	offerDetails: OfferDetails;
	metaData: Omit<Offer, 'details'> | null;
	dictionary: {
		category: Category[];
		entry: Entry[];
	};
}
