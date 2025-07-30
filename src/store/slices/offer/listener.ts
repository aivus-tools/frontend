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
import { addMonthsUTC } from '@/helpers/helper';
import { selectIsNewBrief, selectProjectId } from '../project';
import { briefApi } from '@/services/client/briefApi';
import { selectVendorId } from '../vendor';

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

      const briefQueryState = briefApi.endpoints.getBrief.select(projectId)(state).data;

      if (!briefQueryState) {
        console.warn('Brief query state is not available');
        return;
      }
      if (state.offer.metaData) {
        dispatch(
          offersApi.endpoints.updateOffer.initiate({
            ...state.offer.metaData,
            details: JSON.stringify(state.offer.offerDetails),
          })
        );
      } else {
        const { details, id: briefId } = briefQueryState;
        const vendorId = selectVendorId(state);
        dispatch(
          offersApi.endpoints.createOffer.initiate({
            projectName: details.projectName,
            details: JSON.stringify(state.offer.offerDetails),
            briefId: Number(briefId),
            vendorId: Number(vendorId),
            status: 'DRAFT',
            cost: 0,
            profit: 0,
            deadline: addMonthsUTC(new Date(), 2).toISOString(),
            source: 'PLATFORM',
            isLocked: false,
          })
        );
      }
    },
  });

  startListening({
    matcher: offersApi.endpoints.getOffersByBriefId.matchFulfilled,
    effect: async (action, { dispatch }) => {
      const offer = action.payload[0];
      if (offer) {
        try {
          const { details, ...metaData } = offer;
          dispatch(setMetaData(metaData));
          dispatch(setOfferDetails(JSON.parse(details)));
        } catch (error) {
          console.error('Error parsing offer details:', error);
        }
      }
    },
  });
};
