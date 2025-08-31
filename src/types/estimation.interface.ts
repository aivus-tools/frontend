import { InputNumberProps } from 'antd';
import { ReactNode } from 'react';

export enum UnitType {
  TIME = 'time',
  QUANTITY = 'quantity',
}

export interface TimeUnit {
  type: UnitType.TIME;
  label: string;
  value: number;
  count: number;
}

export interface QuantityUnit {
  type: UnitType.QUANTITY;
  label: string;
  value: number;
  count: number;
}

export interface OfferData {
  id: number;
  entryId: number;
  categoryId: number;
  item: string;
  price: number;
  units: Partial<(TimeUnit | QuantityUnit)[]>;
  taxRate: number;
  taxPrice: number;
  showTax: boolean;
  cost: number;
  surcharge: number;
  isLinkedSurcharge: boolean;
  clientPrice: number;
  clientCost: number;
  marketRange: string;
  options: {
    [UnitType.TIME]: TimeUnit[];
    [UnitType.QUANTITY]: QuantityUnit[];
  };
}

export type HeaderKey = keyof OfferData | 'link' | 'settings' | 'actions' | 'quantity';

export interface Headers {
  label: string | ReactNode;
  key: HeaderKey;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  itemProps?: InputNumberProps<number>;
}

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

export interface EntryVariant {
  id: number;
  label: string;
  children?: EntryVariant[];
}
