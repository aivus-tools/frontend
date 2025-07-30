export interface Offer {
  id: number;
  uuid: string;
  projectName: string;
  parentOfferId?: number;
  briefId: number;
  vendorId: number;
  status: 'DRAFT';
  //
  cost: number;
  //
  profit: number;
  details: string; // JSON stringify(OfferDetails)
  // current date
  deadline: string; // DATE UTC
  // PLATFORM | UPLOAD
  source: 'PLATFORM';
  // возможно ли редактировать
  isLocked: boolean;
  createdAt: string; // DATE UTC
  updatedAt: string; // DATE UTC
}

export type NewOffer = Omit<Offer, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>;
