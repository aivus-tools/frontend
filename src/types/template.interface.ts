import { OfferDetails } from './store.interface';

export interface Template {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  vendorId: string;
  sourceOfferId?: string | null;
  sourceOfferName?: string | null;
  category?: string | null;
  cost?: number | null;
  profit?: number | null;
  details: OfferDetails | Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
}

export interface NewTemplate {
  name: string;
  offerId: string;
  description?: string;
}

export interface ApplyTemplateResponse {
  offerId: string;
  details: OfferDetails | Record<string, unknown>;
}
