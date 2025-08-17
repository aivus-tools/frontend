import { Category, Entry, OfferData } from '@/types/estimation.interface';
import { Offer } from '@/types/offer.interface';

export interface UnforeseenExpenses {
  percent: number;
  clientPercent: number;
  isVisible: boolean;
}

export interface OfferDetails {
  offers: OfferData[];
  categories: Category[];
  subCategories: Category[];
  categorySurcharge: Record<
    number,
    {
      surcharge: number;
      linked: boolean;
    }
  >;
  unforeseenExpenses: UnforeseenExpenses;
  showCostPerVideo: boolean;
  overallSurcharge: number;
  isLinkedOverallSurcharge: boolean;
}

export interface OfferState {
  offerDetails: OfferDetails;
  metaData: Omit<Offer, 'details'> | null;
  dictionary: {
    category: Category[];
    entry: Entry[];
  };
  external: boolean;
}

export interface ExportItem {
  name: string;
  clientPrice: number;
  units: { key: string; value: number }[];
}

export interface CategoryWithSubcategories {
  category: string;
  data: { subcategory: string; items: ExportItem[] }[];
}

export interface CategoryWithoutSubcategories {
  category: string;
  data: { items: ExportItem[] };
}

export type CategoriesExportData = Array<CategoryWithSubcategories | CategoryWithoutSubcategories>;
