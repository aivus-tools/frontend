'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProjectId } from '@/store/slices/project';
import { selectOfferMetaData, selectTemplateId } from '@/store/slices/offer/selectors';
import { setMetaData, setOfferDetails } from '@/store/slices/offer/slice';
import { useGetOffersByProjectIdQuery } from '@/services/client/offersApi';
import logger from '@/lib/logger';

const STORAGE_KEY = 'aivus_selected_offers';

function getStoredOfferId(projectId: string): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const map: Record<string, string> = JSON.parse(stored);
    return map[projectId] || null;
  } catch {
    return null;
  }
}

function storeOfferId(projectId: string, offerId: string) {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const map: Record<string, string> = stored ? JSON.parse(stored) : {};
    map[projectId] = offerId;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Syncs the URL `?offer=<id>` param with Redux offer state.
 * Also persists the selected offer per project in sessionStorage.
 */
export function useOfferSync() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(selectProjectId);
  const currentMeta = useAppSelector(selectOfferMetaData);
  const currentOfferId = currentMeta?.id;
  const templateId = useAppSelector(selectTemplateId);

  const { data: offers = [] } = useGetOffersByProjectIdQuery(projectId!, {
    skip: !projectId || projectId === 'new-brief' || !!templateId,
  });

  useEffect(() => {
    if (templateId) return;
    if (!projectId || offers.length === 0) return;

    const urlOfferId = searchParams.get('offer');

    let targetOfferId = urlOfferId;
    if (!targetOfferId) {
      targetOfferId = getStoredOfferId(projectId);
    }
    if (!targetOfferId) {
      targetOfferId = offers[0]?.id;
    }

    if (!targetOfferId || targetOfferId === currentOfferId) return;

    const offer = offers.find((o) => o.id === targetOfferId);
    if (!offer) return;

    try {
      const { details, ...metaData } = offer;
      dispatch(setMetaData(metaData));
      dispatch(setOfferDetails(typeof details === 'string' ? JSON.parse(details) : details));
      storeOfferId(projectId, offer.id);
    } catch (error) {
      logger.error('Error syncing offer from URL:', error);
    }
  }, [searchParams, offers, currentOfferId, projectId, templateId, dispatch]);

  useEffect(() => {
    if (!currentOfferId || !offers.length) return;
    const offer = offers.find((o) => o.id === currentOfferId);
    if (!offer) return;
    if (offer.status !== currentMeta?.status) {
      const { details, ...metaData } = offer;
      dispatch(setMetaData(metaData));
    }
  }, [offers, currentOfferId, currentMeta?.status, dispatch]);
}
