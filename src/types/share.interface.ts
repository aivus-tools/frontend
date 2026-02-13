export interface Share {
  token: string;
  offerId: string;
  vendorId: string;
  vendorName?: string;
  projectId?: string;
  projectName?: string;
  isActive: boolean;
  ownerName?: string;
  ownerAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSharePayload {
  offerId: string;
}

export interface UpdateSharePayload {
  token: string;
  isActive: boolean;
}

export interface PublicOfferData {
  share: Share;
  offer: {
    id: string;
    projectName: string;
    details: Record<string, unknown>;
    cost?: number | null;
    status: string;
  };
  viewerRole: 'guest' | 'vendor-author' | 'vendor-other' | 'client';
}
