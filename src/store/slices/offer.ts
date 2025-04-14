import { applyPercentage, formatCurrency } from '@/lib/utils';
import { CATEGORIES, ENTRIES } from '@/modules/vendor/estimation/mock';
import { Category, Entry, OfferData } from '@/modules/vendor/estimation/types';
import { createSlice, createSelector } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import clone from 'lodash.clone';

interface UnforeseenExpenses {
	percent: number;
	clientPercent: number;
	isVisible: boolean;
}
export interface offerState {
	offerDetails: {
		offers: OfferData[];
		categories: Category[];
		subCategories: Category[];
		categorySurcharge: Record<
			number,
			{
				surcharge: number;
				linked: boolean;
			}
		>;
		unforeseenExpenses: UnforeseenExpenses;
		showCostPerVideo: boolean;
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
		categorySurcharge: {},
		unforeseenExpenses: {
			percent: 0,
			clientPercent: 0,
			isVisible: true,
		},
		showCostPerVideo: true,
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
					tempState.offerDetails.categorySurcharge[category.id] = {
						surcharge: 0,
						linked: false,
					};
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
		changeOfferRow: (state, action: PayloadAction<Partial<OfferData>>) => {
			const { id, ...newOfferData } = action.payload;
			const index = state.offerDetails.offers.findIndex((offer) => offer.id === id);
			if (index !== -1) {
				const newOffer = { ...state.offerDetails.offers[index], ...newOfferData };
				const unitMultiplier = newOffer.units?.reduce((acc, unit) => acc * (unit?.value ?? 1), 1) ?? 1;
				const { price = 0 } = newOffer;
				const category = state.dictionary.category.find((cat) => cat.id === newOffer.categoryId);
				const rootCategoryId = category?.parentCategoryId ?? category?.id;
				const { linked = false, surcharge = 0 } = state.offerDetails.categorySurcharge[rootCategoryId ?? 0] ?? {};

				newOffer.cost = price * unitMultiplier;
				newOffer.clientPrice = price + applyPercentage(newOffer.cost, linked ? surcharge : newOffer.surcharge);
				newOffer.clientCost = newOffer.clientPrice * unitMultiplier;

				if (newOfferData.surcharge !== undefined) {
					if (rootCategoryId !== undefined) {
						state.offerDetails.categorySurcharge[rootCategoryId].linked = false;
					}
				}

				state.offerDetails.offers[index] = newOffer;
			}
		},
		changeCategorySurcharge: (
			state,
			action: PayloadAction<{
				categoryId: number;
				surcharge?: number;
				linked?: boolean;
			}>
		) => {
			const { categoryId, ...newData } = action.payload;
			const lastData = state.offerDetails.categorySurcharge[categoryId];
			const newCategorySurcharge = { ...lastData, ...newData };
			if (newData.surcharge !== undefined) {
				newCategorySurcharge.linked = true;
			}

			state.offerDetails.categorySurcharge[categoryId] = newCategorySurcharge;
			if (newCategorySurcharge.linked) {
				const currentCategories = state.dictionary.category
					.filter((category) => category.id === categoryId || category.parentCategoryId === categoryId)
					.map((category) => category.id);
				state.offerDetails.offers.forEach((offer) => {
					if (currentCategories.includes(offer.categoryId)) {
						const unitMultiplier = offer.units?.reduce((acc, unit) => acc * (unit?.value ?? 1), 1) ?? 1;
						const { price = 0 } = offer;
						const { surcharge = 0 } = newCategorySurcharge;
						offer.surcharge = surcharge;
						offer.clientPrice = price + applyPercentage(offer.cost, surcharge);
						offer.clientCost = offer.clientPrice * unitMultiplier;
					}
				});
			}
		},
		changeUnforeseenExpenses: (state, action: PayloadAction<Partial<UnforeseenExpenses>>) => {
			state.offerDetails.unforeseenExpenses = {
				...state.offerDetails.unforeseenExpenses,
				...action.payload,
			};
		},
		changeShowCostPerVideo: (state, action: PayloadAction<boolean>) => {
			state.offerDetails.showCostPerVideo = action.payload;
		},
	},
});

export const {
	addOfferRow,
	removeOfferRow,
	changeOfferRow,
	changeCategorySurcharge,
	changeUnforeseenExpenses,
	changeShowCostPerVideo,
} = offerSlice.actions;
export const selectOfferDetails = (state: { offer: offerState }) => state.offer.offerDetails;
export const selectDictionary = (state: { offer: offerState }) => state.offer.dictionary;
export const selectShowCostPerVideo = createSelector(
	[selectOfferDetails],
	(offerDetails) => offerDetails.showCostPerVideo
);
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

export const selectTotalSum = createSelector([selectOfferDetails], (offerDetails) => {
	const value = offerDetails.offers.reduce((acc, offer) => acc + offer.cost, 0);
	return { value, formatted: formatCurrency(value) };
});

export const selectClientTotalSum = createSelector([selectOfferDetails], (offerDetails) => {
	const value = offerDetails.offers.reduce((acc, offer) => acc + offer.clientCost, 0);
	return { value, formatted: formatCurrency(value) };
});

export const selectUnforeseenExpenses = createSelector(
	[selectOfferDetails, selectTotalSum, selectClientTotalSum],
	(offerDetails, { value }, { value: clientValue }) => {
		const { percent, clientPercent, isVisible } = offerDetails.unforeseenExpenses;
		return {
			isVisible,
			percent,
			clientPercent,
			total: formatCurrency(applyPercentage(value, percent)),
			clientTotal: formatCurrency(applyPercentage(clientValue, clientPercent)),
		};
	}
);

export const selectGrandTotal = createSelector(
	[selectTotalSum, selectClientTotalSum, selectUnforeseenExpenses],
	({ value: totalSum }, { value: clientTotalSum }, { percent, clientPercent, isVisible }) => {
		const totalValue = isVisible ? totalSum + applyPercentage(totalSum, percent) : totalSum;
		const clientTotalValue = isVisible
			? clientTotalSum + applyPercentage(clientTotalSum, clientPercent)
			: clientTotalSum;
		return {
			totalValue,
			clientTotalValue,
			total: formatCurrency(totalValue),
			clientTotal: formatCurrency(clientTotalValue),
		};
	}
);

export const selectTotalSumByCategoryId = createSelector(
	[selectOfferDetails, (_, categoryId) => categoryId],
	(offerDetails, categoryId) => {
		const offersSum = offerDetails.offers
			.filter((offer) => offer.categoryId === categoryId)
			.reduce((acc, offer) => acc + offer.cost, 0);

		const subCategoriesSum = offerDetails.subCategories
			.filter((category) => category.parentCategoryId === categoryId)
			.map(({ id }) => id)
			.reduce((acc, subCategoryId) => {
				const offers = offerDetails.offers.filter((offer) => offer.categoryId === subCategoryId);
				return acc + offers.reduce((subAcc, offer) => subAcc + offer.cost, 0);
			}, 0);

		return formatCurrency(offersSum + subCategoriesSum);
	}
);

export const selectAllCategories = createSelector([selectDictionary], (dictionary) => dictionary.category);

export const selectCategorySurcharge = createSelector(
	[selectOfferDetails, (_, categoryId) => categoryId],
	(offerDetails, categoryId) => {
		return offerDetails.categorySurcharge[categoryId] || { surcharge: 0, linked: false };
	}
);
