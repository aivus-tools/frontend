import { OfferDetails } from '@/modules/vendor/estimation/types';
import { createSlice } from '@reduxjs/toolkit';
import set from 'lodash.set';

import type { PayloadAction } from '@reduxjs/toolkit';

export interface offerState {
	offerDetails: OfferDetails;
}

const initialState: offerState = {
	offerDetails: [],
};

export const offerSlice = createSlice({
	name: 'offer',
	initialState,
	reducers: {
		setOfferDetails: (state, action: PayloadAction<OfferDetails>) => {
			state.offerDetails = action.payload;
		},
		removeOfferDetails: (state) => {
			state.offerDetails = [];
		},
		updateField: <T>(state: offerState, action: PayloadAction<{ path: string; value: T }>) => {
			const { path, value } = action.payload;
			set(state.offerDetails, path, value);
		},
	},
});

export const { updateField } = offerSlice.actions;
export const selectOfferDetails = (state: { offer: offerState }) => state.offer.offerDetails;
