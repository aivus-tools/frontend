export interface Category {
  id: string;
  name: string;
  level: number;
  parentCategoryId?: string | null;
  tags?: string[];
}
