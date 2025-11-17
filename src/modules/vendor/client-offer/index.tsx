'use client';

import { Estimation } from '../estimation/Estimation';

/**
 * Client's Offer - simplified view of estimation for clients
 * Shows only client prices, hides internal costs, profit, and markup
 */
export function ClientOffer() {
  return <Estimation clientView />;
}

