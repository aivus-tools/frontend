import { AppStartListening } from '@/store/store';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';
import {
  addDictionaryCategory,
  addDictionaryEntry,
  addOfferRow,
  changeOfferRow,
  removeOfferRow,
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
    matcher: categoriesApi.endpoints.getEntries.matchFulfilled,
    effect: async (action, { dispatch }) => {
      const { payload } = action;
      dispatch(addDictionaryEntry(payload.entries));
    },
  });

  startListening({
    matcher: isAnyOf(addOfferRow, removeOfferRow, changeOfferRow),
    effect: async (_, { dispatch, getState }) => {
      const state = getState();
      const projectId = selectProjectId(state);
      const isNew = selectIsNewBrief(state);

      if (!projectId || isNew) {
        console.warn('Project ID is not set or is a new brief');
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
    effect: async (action, { dispatch }) => {
      const offer = action.payload[0];
      if (offer) {
        try {
          const { details, ...metaData } = offer;
          dispatch(setMetaData(metaData));
          // Details is already an object, no need to parse
          dispatch(setOfferDetails(typeof details === 'string' ? JSON.parse(details) : details));
        } catch (error) {
          console.error('Error parsing offer details:', error);
        }
      }
    },
  });
};
