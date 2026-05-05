export type PreVendorLanguage = 'en' | 'ru';

export interface PreVendor {
  id: string;
  title: string;
  shortDescription: string;
  portfolioUrl: string;
  address: string;
  email: string;
  language: PreVendorLanguage;
  rankLabel: string;
  categoryLabel: string;
  sortOrder: number;
  logoUrl: string;
}

export interface PreVendorsResponse {
  preVendors: PreVendor[];
}
