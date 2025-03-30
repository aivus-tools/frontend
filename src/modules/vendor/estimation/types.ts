import { InputNumberProps } from 'antd';
import { ReactNode } from 'react';

export interface OfferData {
	id: number;
	entryId: number;
	categoryId: number;
	item: string;
	price: number | null;
	units: string;
	quantity: number | null;
	cost: number | null;
	surcharge: string | null;
	clientPrice: number | null;
	clientCost: number | null;
	marketRange: string;
}

export type HeaderKey = keyof OfferData | 'link' | 'settings' | 'actions';

export type Headers = {
	label: string | ReactNode;
	key: HeaderKey;
	style?: React.CSSProperties;
	itemStyle?: React.CSSProperties;
	itemProps?: InputNumberProps<number>;
};

export interface Category {
	id: number;
	name: string;
	parentCategoryId?: number;
}

export interface Entry {
	id: number;
	name: string;
	categoryId: number;
	variants?: EntryVariant[];
}

export type EntryVariant = {
	id: number;
	label: string;
	children?: EntryVariant[];
};

export interface OfferDetails {
	offers: OfferData[];
	categories: Category[];
	subCategories: Category[];
}
