'use client';

import { useCallback, useMemo } from 'react';
import { useGetRateCardsQuery } from '@/services/client/ratesApi';

/**
 * Returns a function to lookup rate card price by entryId.
 */
export function useRateLookup(): (entryId: string) => number | null {
  const { data: rateCards = [] } = useGetRateCardsQuery();

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    rateCards[0]?.items?.forEach((item) => {
      if (item.entryId && item.price) {
        map.set(item.entryId, parseFloat(item.price));
      }
    });
    return map;
  }, [rateCards]);

  return useCallback((entryId: string) => priceMap.get(entryId) ?? null, [priceMap]);
}
