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
  slug: string | null;
  leadNotificationEmail: string;
  customAiInstructions: string;
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
  slug?: string | null;
  leadNotificationEmail?: string;
  customAiInstructions?: string;
}

export interface BrandedBriefSlugInfo {
  valid: boolean;
  vendorName: string;
  vendorLogoUrl: string | null;
  slug: string;
}

export interface BriefDraftBySlugResponse {
  briefId: string;
  token: string;
}

export interface BriefSendResponse {
  ok: boolean;
  finalizingTaskId?: string | null;
}

export interface VendorWebhookKey {
  key: string;
  isActive: boolean;
  createdAt: string | null;
  rotatedAt: string | null;
}

export interface SlugSuggestResponse {
  slug: string;
}

export interface SlugAvailableResponse {
  available: boolean;
}
