import { InputNumberProps } from 'antd';
import { ReactNode } from 'react';

export enum UnitType {
  TIME = 'time',
  QUANTITY = 'quantity',
}

export interface TimeUnit {
  type: UnitType.TIME;
  label: string;
  value: string;
  count: number;
  isDefault?: boolean;
}

export interface QuantityUnit {
  type: UnitType.QUANTITY;
  label: string;
  value: string;
  count: number;
  isDefault?: boolean;
}

export interface OfferData {
  id: string;
  entryId: string;
  categoryId: string;
  item: string;
  price: number;
  units: (TimeUnit | QuantityUnit | undefined)[];
  taxRate: number;
  taxPrice: number;
  showTax: boolean;
  overtime: number;
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

// Re-export from main types to avoid duplication
export type { Category } from './categories.interface';
export type { Entry } from './entries.interface';

export interface EntryVariant {
  id: string;
  label: string;
  children?: EntryVariant[];
}
