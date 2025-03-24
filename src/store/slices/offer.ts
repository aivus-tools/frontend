import { CATEGORIES, ENTRIES } from '@/modules/vendor/estimation/mock';
import { Category, Entry, OfferData } from '@/modules/vendor/estimation/types';
import { createSlice, createSelector } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import clone from 'lodash.clone';

export interface offerState {
	offerDetails: {
		offers: OfferData[];
		categories: Category[];
		subCategories: Category[];
	};
	dictionary: {
		category: Category[];
		entry: Entry[];
	};
}

const initialState: offerState = {
	offerDetails: {
		offers: [],
		categories: [],
		subCategories: [],
	},
	dictionary: {
		category: CATEGORIES,
		entry: ENTRIES,
	},
};

export const offerSlice = createSlice({
	name: 'offer',
	initialState,
	reducers: {
		addOfferRow: (state, action: PayloadAction<OfferData>) => {
			const tempState = clone(state);
			const { categoryId } = action.payload;

			const findCategory = (id: number) =>
				tempState.offerDetails.categories.find((cat) => cat.id === id) ||
				tempState.dictionary.category.find((cat) => cat.id === id);

			const addCategoryIfNeeded = (category: Category) => {
				if (!tempState.offerDetails.categories.some((cat) => cat.id === category.id)) {
					tempState.offerDetails.categories.push(category);
				}
			};

			const addSubCategoryIfNeeded = (subcategory: Category) => {
				if (!tempState.offerDetails.subCategories.some((cat) => cat.id === subcategory.id)) {
					tempState.offerDetails.subCategories.push(subcategory);
				}
			};

			const category = findCategory(categoryId);
			if (!category) {
				console.warn('Category not found', categoryId);
				return;
			}

			if (category.parentCategoryId) {
				addSubCategoryIfNeeded(category);

				const parentCategory = findCategory(category.parentCategoryId);
				if (!parentCategory) {
					console.warn('Parent category not found', category.parentCategoryId);
					return;
				}
				addCategoryIfNeeded(parentCategory);
			} else {
				addCategoryIfNeeded(category);
			}

			tempState.offerDetails.offers.push(action.payload);

			// Обновляем основной state
			Object.assign(state, tempState);
		},
		removeOfferRow: (state, action: PayloadAction<number>) => {
			state.offerDetails.offers = state.offerDetails.offers.filter((offer) => offer.id !== action.payload);
			state.offerDetails.subCategories = state.offerDetails.subCategories.filter((subCategory) =>
				state.offerDetails.offers.find((offer) => offer.categoryId === subCategory.id)
			);
			state.offerDetails.categories = state.offerDetails.categories.filter(
				(category) =>
					state.offerDetails.offers.find((offer) => offer.categoryId === category.id) ||
					state.offerDetails.subCategories.find((subcategory) => subcategory.parentCategoryId === category.id)
			);
		},
	},
});

export const { addOfferRow, removeOfferRow } = offerSlice.actions;
export const selectOfferDetails = (state: { offer: offerState }) => state.offer.offerDetails;
export const selectDictionary = (state: { offer: offerState }) => state.offer.dictionary;
export const selectRootCategories = createSelector([selectOfferDetails], (offerDetails) => {
	return offerDetails.categories.filter((category) => !category.parentCategoryId);
});
export const selectSubcategoryById = createSelector(
	[selectOfferDetails, (_, categoryId) => categoryId],
	(offerDetails, categoryId) => {
		return offerDetails.subCategories.filter((category) => category.parentCategoryId === categoryId);
	}
);

export const selectOffersByCategoryId = createSelector(
	[selectOfferDetails, (_, categoryId) => categoryId],
	(offerDetails, categoryId) => {
		return offerDetails.offers.filter((offer) => offer.categoryId === categoryId);
	}
);

export const selectAllCategories = createSelector([selectDictionary], (dictionary) => dictionary.category);
