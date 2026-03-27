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
  id: string;
  token: string;
  isActive: boolean;
  offer: {
    id: string;
    projectName: string;
    description?: string;
    details: Record<string, unknown>;
    status: string;
    projectId?: string;
  };
  vendor: { id: string; name: string } | null;
}
