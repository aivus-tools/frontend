export interface Category {
  id: number;
  name: string;
  level: number;
  parentCategoryId?: number;
  createdAt: string;
  updatedAt?: string;
}
