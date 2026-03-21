import { applyPercentage, formatCurrency } from '@/lib/utils';
import { createSelector } from '@reduxjs/toolkit';

import {
  CategoriesExportData,
  CategoryExternalMarkup,
  CategoryWithoutSubcategories,
  CategoryWithSubcategories,
  ExportFeeItem,
  ExportItem,
  OfferState,
} from '@/types/store.interface';
import { t } from '@/lib/i18n';
import { OfferData } from '@/types/estimation.interface';

export const selectOfferDetails = (state: { offer: OfferState }) => state.offer.offerDetails;
export const selectDictionary = (state: { offer: OfferState }) => state.offer.dictionary;
export const selectOfferMetaData = (state: { offer: OfferState }) => state.offer.metaData;
export const selectIsExternal = (state: { offer: OfferState }) => state.offer.external;
export const selectTemplateId = (state: { offer: OfferState }) => state.offer.templateId;
export const selectShowCostPerVideo = createSelector(
  [selectOfferDetails],
  (offerDetails) => offerDetails?.showCostPerVideo ?? true
);
export const selectRootCategories = createSelector([selectOfferDetails], (offerDetails) => {
  return offerDetails?.categories?.filter((category) => !category.parentCategoryId) || [];
});
export const selectSubcategoryById = createSelector(
  [selectOfferDetails, (_, categoryId) => categoryId],
  (offerDetails, categoryId) => {
    return offerDetails?.subCategories?.filter((category) => category.parentCategoryId === categoryId) || [];
  }
);

export const selectOffersByCategoryId = createSelector(
  [selectOfferDetails, (_, categoryId) => categoryId],
  (offerDetails, categoryId) => {
    return offerDetails?.offers?.filter((offer) => offer.categoryId === categoryId) || [];
  }
);

export const selectOfferById = createSelector([selectOfferDetails, (_, id: string) => id], (offerDetails, id) => {
  return offerDetails?.offers?.find((offer) => offer.id === id);
});

export const selectTotalSum = createSelector([selectOfferDetails], (offerDetails) => {
  const value = offerDetails?.offers?.reduce((acc, offer) => acc + offer.cost, 0) || 0;
  return { value, formatted: formatCurrency(value) };
});

export const selectClientTotalSum = createSelector([selectOfferDetails], (offerDetails) => {
  const value = offerDetails?.offers?.reduce((acc, offer) => acc + offer.clientCost, 0) || 0;
  return { value, formatted: formatCurrency(value) };
});

const getCategorySubtotals = (offerDetails: OfferState['offerDetails'], categoryId: string) => {
  const offers = offerDetails?.offers || [];
  const directOffers = offers.filter(x => x.categoryId === categoryId);
  let vendorSum = directOffers.reduce((acc, x) => acc + x.cost, 0);
  let clientSum = directOffers.reduce((acc, x) => acc + x.clientCost, 0);

  const subCategoryIds = (offerDetails?.subCategories || [])
    .filter(x => x.parentCategoryId === categoryId)
    .map(x => x.id);

  for (const subId of subCategoryIds) {
    const subOffers = offers.filter(x => x.categoryId === subId);
    vendorSum += subOffers.reduce((acc, x) => acc + x.cost, 0);
    clientSum += subOffers.reduce((acc, x) => acc + x.clientCost, 0);
  }

  return { vendorSum, clientSum };
};

export interface FeeRow {
  key: string;
  name: string;
  percent: number;
  vendorAmount: number;
  clientAmount: number;
}

const buildCategoryFees = (
  categoryId: string,
  tags: string[],
  vendorSum: number,
  clientSum: number,
  metaData: OfferState['metaData'],
  customFeeNames: Record<string, string>,
  externalMarkup: CategoryExternalMarkup | null,
): FeeRow[] => {
  const fees: FeeRow[] = [];
  const hasExternalMarkup = !!externalMarkup?.enabled && externalMarkup.percent > 0;
  if (tags.includes('production')) {
    const insurancePct = parseFloat(metaData?.productionInsurancePercent || '0') || 0;
    const feePct = parseFloat(metaData?.productionFeePercent || '0') || 0;
    if (insurancePct > 0) {
      fees.push({ key: 'PROD_INSURANCE', name: customFeeNames['PROD_INSURANCE'] || t('PROD_INSURANCE'), percent: insurancePct, vendorAmount: applyPercentage(vendorSum, insurancePct), clientAmount: applyPercentage(clientSum, insurancePct) });
    }
    if (feePct > 0 && !hasExternalMarkup) {
      fees.push({ key: 'PROD_FEE', name: customFeeNames['PROD_FEE'] || t('PROD_FEE'), percent: feePct, vendorAmount: applyPercentage(vendorSum, feePct), clientAmount: applyPercentage(clientSum, feePct) });
    }
  }
  if (tags.includes('post_production')) {
    const insurancePct = parseFloat(metaData?.postInsurancePercent || '0') || 0;
    const markupPct = parseFloat(metaData?.postMarkupPercent || '0') || 0;
    const taxPct = parseFloat(metaData?.postTaxPercent || '0') || 0;
    if (insurancePct > 0) {
      fees.push({ key: 'POST_INSURANCE', name: customFeeNames['POST_INSURANCE'] || t('POST_INSURANCE'), percent: insurancePct, vendorAmount: applyPercentage(vendorSum, insurancePct), clientAmount: applyPercentage(clientSum, insurancePct) });
    }
    if (markupPct > 0 && !hasExternalMarkup) {
      fees.push({ key: 'POST_MARKUP', name: customFeeNames['POST_MARKUP'] || t('POST_MARKUP'), percent: markupPct, vendorAmount: applyPercentage(vendorSum, markupPct), clientAmount: applyPercentage(clientSum, markupPct) });
    }
    if (taxPct > 0) {
      fees.push({ key: 'POST_TAX', name: customFeeNames['POST_TAX'] || t('POST_TAX'), percent: taxPct, vendorAmount: applyPercentage(vendorSum, taxPct), clientAmount: applyPercentage(clientSum, taxPct) });
    }
  }
  if (hasExternalMarkup) {
    fees.push({
      key: 'EXT_MARKUP_' + categoryId,
      name: externalMarkup!.name || 'Markup',
      percent: externalMarkup!.percent,
      vendorAmount: applyPercentage(vendorSum, externalMarkup!.percent),
      clientAmount: applyPercentage(clientSum, externalMarkup!.percent),
    });
  }
  return fees;
};

const resolveCategoryTags = (
  categoryId: string,
  offerDetails: OfferState['offerDetails'],
  dictionary: OfferState['dictionary'],
): string[] => {
  const category = offerDetails?.categories?.find(x => x.id === categoryId)
    || offerDetails?.subCategories?.find(x => x.id === categoryId);
  const tags = category?.tags || [];
  if (tags.length > 0) {
    return tags;
  }
  const dictCategory = dictionary?.category?.find(x => x.id === categoryId);
  return dictCategory?.tags || [];
};

export const selectCategoryFees = createSelector(
  [selectOfferDetails, selectOfferMetaData, selectDictionary, (_: { offer: OfferState }, categoryId: string) => categoryId],
  (offerDetails, metaData, dictionary, categoryId): FeeRow[] => {
    const tags = resolveCategoryTags(categoryId, offerDetails, dictionary);
    const { vendorSum, clientSum } = getCategorySubtotals(offerDetails, categoryId);
    const customFeeNames = offerDetails?.customFeeNames || {};
    const externalMarkup = offerDetails?.categoryExternalMarkup?.[categoryId] || null;
    if (tags.length === 0 && !externalMarkup?.enabled) {
      return [];
    }
    return buildCategoryFees(categoryId, tags, vendorSum, clientSum, metaData, customFeeNames, externalMarkup);
  }
);

export const selectAllCategoryFeesTotal = createSelector(
  [selectOfferDetails, selectOfferMetaData, selectDictionary],
  (offerDetails, metaData, dictionary) => {
    let vendorTotal = 0;
    let clientTotal = 0;
    const customFeeNames = offerDetails?.customFeeNames || {};
    for (const category of offerDetails?.categories || []) {
      const tags = resolveCategoryTags(category.id, offerDetails, dictionary);
      const externalMarkup = offerDetails?.categoryExternalMarkup?.[category.id] || null;
      const { vendorSum, clientSum } = getCategorySubtotals(offerDetails, category.id);
      const fees = buildCategoryFees(category.id, tags, vendorSum, clientSum, metaData, customFeeNames, externalMarkup);
      for (const fee of fees) {
        vendorTotal += fee.vendorAmount;
        clientTotal += fee.clientAmount;
      }
    }
    return { vendorTotal, clientTotal };
  }
);

export const selectUnforeseenExpenses = createSelector(
  [selectOfferDetails, selectTotalSum, selectAllCategoryFeesTotal],
  (offerDetails, { value }, { vendorTotal: vendorFees }) => {
    const { percent = 0, isVisible = true } = offerDetails?.unforeseenExpenses || {};
    const vendorBase = value + vendorFees;
    return {
      isVisible,
      percent,
      total: formatCurrency(applyPercentage(vendorBase, percent)),
    };
  }
);

export const selectGrandTotal = createSelector(
  [selectTotalSum, selectClientTotalSum, selectAllCategoryFeesTotal, selectUnforeseenExpenses],
  ({ value: totalSum }, { value: clientTotalSum }, { vendorTotal: vendorFees, clientTotal: clientFees }, { percent, isVisible }) => {
    const vendorBase = totalSum + vendorFees;
    const clientTotalValue = clientTotalSum + clientFees;
    const totalValue = isVisible ? vendorBase + applyPercentage(vendorBase, percent) : vendorBase;
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
    if (!offerDetails?.offers) {
      return {
        total: formatCurrency(0),
        clientTotal: formatCurrency(0),
      };
    }

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

    const filteredSubCategories = (offerDetails.subCategories || [])
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

export const selectAllCategories = createSelector([selectDictionary], (dictionary) => dictionary?.category ?? []);

export const selectCategorySurcharge = createSelector(
  [selectOfferDetails, (_, categoryId) => categoryId],
  (offerDetails, categoryId) => {
    return offerDetails?.categorySurcharge?.[categoryId] || { surcharge: 0, linked: false };
  }
);

export const selectCategoryExternalMarkup = createSelector(
  [selectOfferDetails, (_, categoryId: string) => categoryId],
  (offerDetails, categoryId): CategoryExternalMarkup | null => {
    return offerDetails?.categoryExternalMarkup?.[categoryId] || null;
  }
);

export const selectCategoryTotalWithFees = createSelector(
  [selectOfferDetails, selectOfferMetaData, selectDictionary, (_: { offer: OfferState }, categoryId: string) => categoryId],
  (offerDetails, metaData, dictionary, categoryId) => {
    const { vendorSum, clientSum } = getCategorySubtotals(offerDetails, categoryId);
    const tags = resolveCategoryTags(categoryId, offerDetails, dictionary);
    const customFeeNames = offerDetails?.customFeeNames || {};
    const externalMarkup = offerDetails?.categoryExternalMarkup?.[categoryId] || null;
    const fees = buildCategoryFees(categoryId, tags, vendorSum, clientSum, metaData, customFeeNames, externalMarkup);
    const vendorFeeSum = fees.reduce((acc, x) => acc + x.vendorAmount, 0);
    const clientFeeSum = fees.reduce((acc, x) => acc + x.clientAmount, 0);
    return {
      total: formatCurrency(vendorSum + vendorFeeSum),
      clientTotal: formatCurrency(clientSum + clientFeeSum),
    };
  }
);

export const selectOverallSurcharge = createSelector([selectOfferDetails], (offerDetails) => {
  return {
    surcharge: offerDetails?.overallSurcharge ?? 0,
    linked: offerDetails?.isLinkedOverallSurcharge ?? false,
  };
});
export const makeSelectCostPerVideo = () =>
  createSelector(
    [selectGrandTotal, (_: { offer: OfferState }, count: number) => (Number.isFinite(count) && count > 0 ? count : 1)],
    ({ totalValue, clientTotalValue }, count) => {
      const safe = count === 0 ? 1 : count;

      return {
        vendor: totalValue / safe,
        client: clientTotalValue / safe,
      };
    }
  );

export const selectCategoriesExportData = createSelector(
  [selectOfferDetails, selectRootCategories, selectOfferMetaData, selectDictionary],
  (offerDetails, rootCategories, metaData, dictionary): CategoriesExportData => {
    const prepareUnits = (units: OfferData['units']) => {
      return units
        .map((unit) => {
          if (!unit) {
            return undefined;
          }

          return { key: unit.label, value: unit.count };
        })
        .filter((unit): unit is { key: string; value: number } => unit !== undefined);
    };

    const buildExportFees = (categoryId: string): ExportFeeItem[] => {
      const tags = resolveCategoryTags(categoryId, offerDetails, dictionary);
      const { vendorSum } = getCategorySubtotals(offerDetails, categoryId);
      const customFeeNames = offerDetails?.customFeeNames || {};
      const externalMarkup = offerDetails?.categoryExternalMarkup?.[categoryId] || null;
      const feeRows = buildCategoryFees(categoryId, tags, vendorSum, vendorSum, metaData, customFeeNames, externalMarkup);
      return feeRows.map((x) => ({ name: x.name, percent: x.percent, amount: x.vendorAmount }));
    };

    return rootCategories.map((category): CategoryWithSubcategories | CategoryWithoutSubcategories => {
      const subCategories = (offerDetails?.subCategories || []).filter(
        (subCategory) => subCategory.parentCategoryId === category.id
      );

      const fees = buildExportFees(category.id);

      if (subCategories.length > 0) {
        const data: Array<{ subcategory: string; items: ExportItem[] }> = [];

        const directItems: ExportItem[] = (offerDetails?.offers || [])
          .filter((offer) => offer.categoryId === category.id)
          .map((offer) => ({
            name: offer.item,
            price: offer.taxPrice,
            units: prepareUnits(offer.units),
          }));
        if (directItems.length > 0) {
          data.push({ subcategory: category.name, items: directItems });
        }

        for (const subCategory of subCategories) {
          const items: ExportItem[] = (offerDetails?.offers || [])
            .filter((offer) => offer.categoryId === subCategory.id)
            .map((offer) => ({
              name: offer.item,
              price: offer.taxPrice,
              units: prepareUnits(offer.units),
            }));

          data.push({ subcategory: subCategory.name, items });
        }

        return {
          category: category.name,
          data,
          fees,
        };
      }

      const items: ExportItem[] = (offerDetails?.offers || [])
        .filter((offer) => offer.categoryId === category.id)
        .map((offer) => ({
          name: offer.item,
          price: offer.taxPrice,
          units: prepareUnits(offer.units),
        }));

      return {
        category: category.name,
        data: { items },
        fees,
      };
    });
  }
);
