export interface Entry {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  units?: {
    quantity: UnitOption[];
    temporal: UnitOption[];
  };
}

export type UnitOption = {
  id: string;
  name: string;
  symbol: string;
  dimension: string;
  isDefault: boolean;
};
