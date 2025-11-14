import { Category } from '@/types/categories.interface';

export interface Entry {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  categoryId: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  units: {
    quantity: UnitOption[];
    temporal: UnitOption[];
  };
  categoryPath: Category[];
}

export type UnitOption = {
  id: number;
  name: string;
  symbol: string;
  isDefault: boolean;
};
