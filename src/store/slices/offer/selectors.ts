import { applyPercentage, formatCurrency } from '@/lib/utils';
import { createSelector } from '@reduxjs/toolkit';

import { OfferState } from './types';

export const selectOfferDetails = (state: { offer: OfferState }) => state.offer.offerDetails;
export const selectDictionary = (state: { offer: OfferState }) => state.offer.dictionary;
export const selectOfferMetaData = (state: { offer: OfferState }) => state.offer.metaData;
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
		const { sum, clientSum } = offerDetails.offers
			.filter((offer) => offer.categoryId === categoryId)
			.reduce(
				(acc, offer) => {
					acc.sum += offer.cost;
					acc.clientSum += offer.clientCost;
					return acc;
				},
				{ sum: 0, clientSum: 0 }
			);

		const filteredSubCategories = offerDetails.subCategories
			.filter((category) => category.parentCategoryId === categoryId)
			.map(({ id }) => id);

		const subCategoriesSum = filteredSubCategories.reduce((acc, subCategoryId) => {
			const offers = offerDetails.offers.filter((offer) => offer.categoryId === subCategoryId);
			return acc + offers.reduce((subAcc, offer) => subAcc + offer.cost, 0);
		}, 0);

		const subCategoriesClientSum = filteredSubCategories.reduce((acc, subCategoryId) => {
			const offers = offerDetails.offers.filter((offer) => offer.categoryId === subCategoryId);
			return acc + offers.reduce((subAcc, offer) => subAcc + offer.clientCost, 0);
		}, 0);

		return {
			total: formatCurrency(sum + subCategoriesSum),
			clientTotal: formatCurrency(clientSum + subCategoriesClientSum),
		};
	}
);

export const selectAllCategories = createSelector([selectDictionary], (dictionary) => dictionary.category);

export const selectCategorySurcharge = createSelector(
	[selectOfferDetails, (_, categoryId) => categoryId],
	(offerDetails, categoryId) => {
		return offerDetails.categorySurcharge[categoryId] || { surcharge: 0, linked: false };
	}
);
