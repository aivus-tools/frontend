import { ReactNode } from 'react';

export type OfferData = {
	id: number;
	entryId: number;
	categoryId: number;
	item: string;
	price: number;
	units: string;
	quantity: number;
	cost: number;
	surcharge: string;
	clientPrice: number;
	clientCost: number;
	marketRange: string;
};

export type Headers = {
	label: string | ReactNode;
	key: keyof OfferData | 'link' | 'settings' | 'actions';
	style?: React.CSSProperties;
	itemStyle?: React.CSSProperties;
};

export type Category = {
	id: number;
	name: string;
	parentCategoryId?: number;
};

export type Entry = {
	id: number;
	name: string;
	categoryId: number;
	variants?: EntryVariant[];
};

export type EntryVariant = {
	id: number;
	label: string;
	children?: EntryVariant[];
};
