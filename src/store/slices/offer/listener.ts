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
  setCustomFeeName,
  setCategoryExternalMarkup,
  resetOffer,
} from './slice';
import { isAnyOf } from '@reduxjs/toolkit';
import { setProjectId, selectIsNewBrief, selectProjectId } from '../project';

export const offerListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: setProjectId,
    effect: async (_, { dispatch }) => {
      dispatch(resetOffer());
    },
  });

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
      changeShowCostPerVideo,
      setCustomFeeName,
      setCategoryExternalMarkup
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

};
