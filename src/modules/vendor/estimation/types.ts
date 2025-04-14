import { InputNumberProps } from 'antd';
import { ReactNode } from 'react';

export enum UnitType {
	TIME = 'time',
	QUANTITY = 'quantity',
}

export interface TimeUnit {
	id: string;
	label: string;
	type: UnitType.TIME;
	value: number;
}

export interface QuantityUnit {
	id: string;
	label: string;
	type: UnitType.QUANTITY;
	value: number;
}

export interface OfferData {
	id: number;
	entryId: number;
	categoryId: number;
	item: string;
	price: number;
	units: Partial<(TimeUnit | QuantityUnit)[]>;
	cost: number;
	surcharge: number;
	clientPrice: number;
	clientCost: number;
	marketRange: string;
}

export type HeaderKey = keyof OfferData | 'link' | 'settings' | 'actions' | 'quantity';

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
