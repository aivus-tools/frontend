'use client';

import React from 'react';
import { ClientOfferTable } from './ClientOfferTable';

/**
 * Client's Offer - read-only view of estimation for clients
 * Shows only client prices (no editing, no sidebar)
 */
export function ClientOffer() {
  return <ClientOfferTable />;
}

