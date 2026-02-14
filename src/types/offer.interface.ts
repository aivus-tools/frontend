import { OfferDetails } from './store.interface';

export const source = ['PLATFORM', 'UPLOAD'] as const;

export interface Offer {
  id: string;
  uuid: string;
  projectName: string;
  parentOfferId?: string | null;
  projectId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  cost?: number | null;
  profit?: number | null;
  details: OfferDetails | Record<string, unknown>; // JSON object (OfferDetails)
  deadline: string; // DATE UTC
  source: (typeof source)[number];
  isLocked: boolean;
  createdAt: string; // DATE UTC
  updatedAt: string; // DATE UTC
}

export type NewOffer = Omit<Offer, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>;
