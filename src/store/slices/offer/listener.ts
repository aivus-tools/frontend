import { AppStartListening } from '@/store/store';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';
import { templatesApi } from '@/services/client/templatesApi';
import logger from '@/lib/logger';
import {
  addDictionaryCategory,
  addDictionaryEntry,
  addOfferRow,
  changeOfferRow,
  removeOfferRow,
  changeCategorySurcharge,
  changeOverallSurcharge,
  changeUnforeseenExpenses,
  changeShowCostPerVideo,
  setMetaData,
  setOfferDetails,
} from './slice';
import { isAnyOf } from '@reduxjs/toolkit';
import { selectIsNewBrief, selectProjectId } from '../project';

export const offerListener = (startListening: AppStartListening) => {
  startListening({
    matcher: categoriesApi.endpoints.getCategories.matchFulfilled,
    effect: async (action, { dispatch }) => {
      const { payload } = action;
      dispatch(addDictionaryCategory(payload));
    },
  });

  startListening({
    matcher: categoriesApi.endpoints.getEntriesFull.matchFulfilled,
    effect: async (action, { dispatch }) => {
      const { payload } = action;
      dispatch(addDictionaryEntry(payload.entries));
    },
  });

  startListening({
    matcher: isAnyOf(
      addOfferRow,
      removeOfferRow,
      changeOfferRow,
      changeCategorySurcharge,
      changeOverallSurcharge,
      changeUnforeseenExpenses,
      changeShowCostPerVideo
    ),
    effect: async (_, { dispatch, getState }) => {
      const state = getState();
      const templateId = state.offer.templateId;

      // Template mode: save to template API instead of offer API
      if (templateId) {
        dispatch(
          templatesApi.endpoints.updateTemplate.initiate({
            id: templateId,
            body: { details: state.offer.offerDetails },
          })
        );
        return;
      }

      const projectId = selectProjectId(state);
      const isNew = selectIsNewBrief(state);

      if (!projectId || isNew) {
        logger.warn('Project ID is not set or is a new brief');
        return;
      }

      // TODO: This listener needs to be updated to work with Projects instead of Briefs
      // For now, it only handles updating existing offers
      if (state.offer.metaData) {
        dispatch(
          offersApi.endpoints.updateOffer.initiate({
            ...state.offer.metaData,
            details: state.offer.offerDetails, // Changed from JSON.stringify
          })
        );
      }
      // Note: Offer creation is now handled in useMutateBrief hook
    },
  });

  startListening({
    matcher: offersApi.endpoints.getOffersByProjectId.matchFulfilled,
    effect: async (action, { dispatch, getState }) => {
      const state = getState();
      const currentOfferId = state.offer.metaData?.id;
      // Load the specific offer matching the current offerId, or fall back to the first offer
      const offer = (currentOfferId
        ? action.payload.find((o) => o.id === currentOfferId)
        : action.payload[0]) ?? action.payload[0];
      if (offer) {
        try {
          const { details, ...metaData } = offer;
          dispatch(setMetaData(metaData));
          // Details is already an object, no need to parse
          dispatch(setOfferDetails(typeof details === 'string' ? JSON.parse(details) : details));
        } catch (error) {
          logger.error('Error parsing offer details:', error);
        }
      }
    },
  });
};
