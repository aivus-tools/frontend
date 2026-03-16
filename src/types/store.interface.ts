import { Category, Entry, OfferData } from '@/types/estimation.interface';
import { Offer } from '@/types/offer.interface';

export interface UnforeseenExpenses {
  percent: number;
  isVisible: boolean;
}

export interface CategoryExternalMarkup {
  enabled: boolean;
  percent: number;
  name: string;
}

export interface OfferDetails {
  offers: OfferData[];
  categories: Category[];
  subCategories: Category[];
  categorySurcharge: Record<
    string,
    {
      surcharge: number;
      linked: boolean;
    }
  >;
  categoryExternalMarkup: Record<string, CategoryExternalMarkup>;
  customFeeNames: Record<string, string>;
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
  templateId: string | null;
}

export interface ExportItem {
  name: string;
  price: number;
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
