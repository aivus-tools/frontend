export interface VendorSettings {
  id: string;
  vendorId: string;
  logoUrl: string | null;
  companyName: string;
  agencyName: string;
  fringesPercent: string;
  handlingPercent: string;
  markupPercent: string;
  productionInsurancePercent: string;
  productionFeePercent: string;
  postMarkupPercent: string;
  postInsurancePercent: string;
  postTaxPercent: string;
  updatedAt: string;
}

export interface UpdateVendorSettingsPayload {
  companyName?: string;
  agencyName?: string;
  fringesPercent?: string;
  handlingPercent?: string;
  markupPercent?: string;
  productionInsurancePercent?: string;
  productionFeePercent?: string;
  postMarkupPercent?: string;
  postInsurancePercent?: string;
  postTaxPercent?: string;
}
