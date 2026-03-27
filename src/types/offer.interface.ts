import { OfferDetails } from './store.interface';

export const source = ['PLATFORM', 'UPLOAD'] as const;

export interface OfferDeliverable {
  id?: string;
  quantity: number;
  duration: string;
  durationUnit: string;
  notes: string;
  sortOrder: number;
}

export interface OfferScheduleEntry {
  id?: string;
  phaseType: string;
  days: number;
  hoursPerDay: number;
  notes: string;
  sortOrder: number;
}

export interface Offer {
  id: string;
  uuid: string;
  projectName: string;
  parentOfferId?: string | null;
  projectId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  cost?: number | null;
  profit?: number | null;
  details: OfferDetails | Record<string, unknown>;
  deadline: string;
  source: (typeof source)[number];
  isLocked: boolean;
  bidDate?: string | null;
  revision?: string;
  term?: string;
  territory?: string[];
  mediaPlacements?: string[];
  coverPageNotes?: string;
  assumptionsExclusions?: string;
  fringesPercent?: string;
  handlingPercent?: string;
  markupPercent?: string;
  productionInsurancePercent?: string;
  productionFeePercent?: string;
  postMarkupPercent?: string;
  postInsurancePercent?: string;
  postTaxPercent?: string;
  deliverables?: OfferDeliverable[];
  scheduleEntries?: OfferScheduleEntry[];
  createdAt: string;
  updatedAt: string;
}

export type NewOffer = Omit<Offer, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>;
