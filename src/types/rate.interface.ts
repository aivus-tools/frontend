/**
 * RateCardItem — individual rate item within a rate card.
 * Matches backend serialize_rate_card_item() output.
 */
export interface RateCardItem {
  id: string;
  rateCardId: string;
  entryId: string | null;
  itemName: string;
  price: string; // decimal string from backend
  unitId: string | null;
  unitLabel: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * RateCard — a named collection of standard prices for a vendor.
 * Matches backend serialize_rate_card() output.
 */
export interface RateCard {
  id: string;
  vendorId: string;
  name: string;
  items: RateCardItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for creating/updating rate card items.
 */
export interface RateCardItemPayload {
  entryId?: string | null;
  itemName: string;
  price: number | string;
  unitId?: string | null;
  unitLabel?: string;
}

/**
 * Payload for creating a rate card.
 */
export interface CreateRateCardPayload {
  name: string;
  items: RateCardItemPayload[];
}

/**
 * Payload for updating a rate card.
 */
export interface UpdateRateCardPayload {
  name?: string;
  items?: RateCardItemPayload[];
}
