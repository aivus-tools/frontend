import { Category } from '@/types/categories.interface';
import { Vendor } from '@/types/vendor.interface';

export const rateOption = ['fixed', 'percentage'] as const;

export interface Rate {
  id: number;
  name: string;
  description?: string;
  vendorId: number;
  entryId?: number;
  basePrice: number;
  totalPrice: number;
  options: string; // JSON строка с массивом опций
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  vendor: Vendor;
  entry?: {
    id: number;
    name: string;
    description?: string;
    categoryRef: Category;
  };
}

export interface ChangeRate {
  name: string;
  basePrice: number;
  description?: string;
  entryId?: number;
  options?: [
    {
      name: string;
      description: string;
      type: typeof rateOption;
      value: number;
    },
  ];
}
