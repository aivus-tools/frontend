import { round } from '@/lib/utils';
import { Category, OfferData, Entry } from '@/types/estimation.interface';
import { createSlice } from '@reduxjs/toolkit';
import logger from '@/lib/logger';

import type { PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash.clonedeep';
import { CategoryExternalMarkup, OfferDetails, OfferState, UnforeseenExpenses } from '@/types/store.interface';
import { CATEGORIES } from '@/modules/vendor/estimation/mock/categories';
import { ENTRIES } from '@/modules/vendor/estimation/mock/entries';

const getFringesPercent = (state: OfferState): number => {
  return parseFloat(state.metaData?.fringesPercent || '0') || 0;
};

const getEffectiveFringes = (offer: OfferData, state: OfferState): number => {
  return offer.showTax ? offer.taxRate : getFringesPercent(state);
};

const calcBasePrice = (price: number, overtime: number, fringesPercent: number): number => {
  const base = price + (overtime || 0);
  return fringesPercent > 0 ? round(base * (1 + fringesPercent / 100)) : base;
};

const initialState: OfferState = {
  offerDetails: {
    offers: [],
    categories: [],
    subCategories: [],
    categorySurcharge: {},
    categoryExternalMarkup: {},
    customFeeNames: {},
    unforeseenExpenses: {
      percent: 0,
      isVisible: true,
    },
    showCostPerVideo: true,
    overallSurcharge: 0,
    isLinkedOverallSurcharge: false,
  },
  metaData: null,
  dictionary: {
    category: [],
    entry: [],
  },
  external: false,
  templateId: null,
};

export const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    setOfferDetails: (state, action: PayloadAction<OfferDetails>) => {
      state.offerDetails = {
        ...action.payload,
        offers: action.payload.offers || [],
        categories: action.payload.categories || [],
        subCategories: action.payload.subCategories || [],
        categorySurcharge: action.payload.categorySurcharge || {},
        categoryExternalMarkup: action.payload.categoryExternalMarkup ?? state.offerDetails.categoryExternalMarkup ?? {},
        customFeeNames: action.payload.customFeeNames ?? state.offerDetails.customFeeNames ?? {},
      };
      if (state.offerDetails?.offers) {
        state.offerDetails.offers.forEach((offer) => {
          if ((offer.price > 0 || (offer.overtime || 0) > 0) && offer.cost === 0) {
            const unitMultiplier = offer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
            const fringes = getEffectiveFringes(offer, state);
            const fringesPrice = calcBasePrice(offer.price, offer.overtime || 0, fringes);
            offer.taxPrice = fringesPrice;
            offer.cost = round(fringesPrice * unitMultiplier);
            if (offer.clientPrice > 0 && offer.clientCost === 0) {
              offer.clientCost = round(offer.clientPrice * unitMultiplier);
            }
          }
        });
      }
    },
    setMetaData: (state, action: PayloadAction<OfferState['metaData']>) => {
      state.metaData = action.payload;
    },
    addOfferRow: (state, action: PayloadAction<OfferData>) => {
      const tempState = cloneDeep(state);
      const { categoryId } = action.payload;

      const findCategory = (id: string) =>
        tempState.offerDetails?.categories?.find((cat) => cat.id === id) ||
        tempState.dictionary?.category?.find((cat) => cat.id === id);

      const addCategoryIfNeeded = (category: Category) => {
        if (!tempState.offerDetails?.categories) {
          tempState.offerDetails.categories = [];
        }
        if (!tempState.offerDetails?.categorySurcharge) {
          tempState.offerDetails.categorySurcharge = {};
        }
        if (!tempState.offerDetails.categories.some((cat) => cat.id === category.id)) {
          tempState.offerDetails.categories.push(category);
          tempState.offerDetails.categorySurcharge[category.id] = {
            surcharge: state.offerDetails.isLinkedOverallSurcharge ? state.offerDetails.overallSurcharge : 0,
            linked: true,
          };
          if (!tempState.offerDetails.categoryExternalMarkup) {
            tempState.offerDetails.categoryExternalMarkup = {};
          }
          if (!tempState.offerDetails.categoryExternalMarkup[category.id]) {
            tempState.offerDetails.categoryExternalMarkup[category.id] = {
              enabled: false,
              percent: parseFloat(state.metaData?.markupPercent || '0') || 0,
              name: 'Markup',
            };
          }
        }
      };

      const addSubCategoryIfNeeded = (subcategory: Category) => {
        if (!tempState.offerDetails?.subCategories) {
          tempState.offerDetails.subCategories = [];
        }
        if (!tempState.offerDetails.subCategories.some((cat) => cat.id === subcategory.id)) {
          tempState.offerDetails.subCategories.push(subcategory);
        }
      };

      const getCategorySurcharge = (category: Category) => {
        if (category.parentCategoryId) {
          return tempState.offerDetails.categorySurcharge[category.parentCategoryId]?.surcharge;
        }
        if (tempState.offerDetails.categorySurcharge[category.id]?.surcharge) {
          return tempState.offerDetails.categorySurcharge[category.id]?.surcharge;
        }
        return 0;
      };

      const category = findCategory(categoryId);
      if (!category) {
        logger.warn('Category not found', categoryId);
        return;
      }

      if (category.parentCategoryId) {
        addSubCategoryIfNeeded(category);

        const parentCategory = findCategory(category.parentCategoryId);
        if (!parentCategory) {
          logger.warn('Parent category not found', category.parentCategoryId);
          return;
        }
        addCategoryIfNeeded(parentCategory);
      } else {
        addCategoryIfNeeded(category);
      }

      if (!tempState.offerDetails?.offers) {
        tempState.offerDetails.offers = [];
      }
      const categorySurcharge = getCategorySurcharge(category);
      const newOffer = {
        ...action.payload,
        surcharge: categorySurcharge,
      };

      if (newOffer.price > 0 || (newOffer.overtime || 0) > 0) {
        const unitMultiplier = newOffer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
        const fringes = getEffectiveFringes(newOffer, tempState);
        const fringesPrice = calcBasePrice(newOffer.price, newOffer.overtime || 0, fringes);
        newOffer.taxPrice = fringesPrice;
        newOffer.cost = round(fringesPrice * unitMultiplier);
        newOffer.clientPrice = round(fringesPrice * (1 + categorySurcharge / 100));
        newOffer.clientCost = round(newOffer.clientPrice * unitMultiplier);
      }

      tempState.offerDetails.offers.push(newOffer);

      // Update the main state
      Object.assign(state, tempState);
    },
    removeOfferRow: (state, action: PayloadAction<string>) => {
      if (!state.offerDetails?.offers) return;

      state.offerDetails.offers = state.offerDetails.offers.filter((offer) => offer.id !== action.payload);

      if (state.offerDetails?.subCategories) {
        state.offerDetails.subCategories = state.offerDetails.subCategories.filter((subCategory) =>
          state.offerDetails.offers.find((offer) => offer.categoryId === subCategory.id)
        );
      }

      if (state.offerDetails?.categories) {
        state.offerDetails.categories = state.offerDetails.categories.filter(
          (category) =>
            state.offerDetails.offers.find((offer) => offer.categoryId === category.id) ||
            state.offerDetails.subCategories?.find((subcategory) => subcategory.parentCategoryId === category.id)
        );
      }
    },
    changeOfferRow: (state, action: PayloadAction<Partial<OfferData>>) => {
      if (!state.offerDetails?.offers) return;

      const { id, ...newOfferData } = action.payload;
      const index = state.offerDetails.offers.findIndex((offer) => offer.id === id);

      if (index === -1) {
        return;
      }

      const newOffer = { ...state.offerDetails.offers[index], ...newOfferData };

      const updatedParameter = Object.keys(newOfferData).filter((key): key is keyof OfferData => key in newOffer);


      const unitMultiplier = newOffer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
      const category = state.dictionary.category.find((cat) => cat.id === newOffer.categoryId);
      const rootCategoryId = category?.parentCategoryId ?? category?.id;
      const { surcharge: catSurcharge = 0 } = state.offerDetails.categorySurcharge[rootCategoryId ?? ''] ?? {};

      const fringes = getEffectiveFringes(newOffer, state);

      if (updatedParameter.includes('taxPrice') && updatedParameter.length === 1) {
        const currentFringesPrice = calcBasePrice(newOffer.price, newOffer.overtime || 0, fringes);
        newOffer.cost = round(currentFringesPrice * unitMultiplier);
        const markup = newOffer.isLinkedSurcharge ? catSurcharge : newOffer.surcharge;
        newOffer.clientPrice = round(currentFringesPrice * (1 + markup / 100));
        newOffer.clientCost = round(newOffer.clientPrice * unitMultiplier);
        state.offerDetails.offers[index] = newOffer;

        return;
      }

      if (updatedParameter.includes('clientPrice') && updatedParameter.length === 1) {
        const currentFringesPrice = calcBasePrice(newOffer.price, newOffer.overtime || 0, fringes);
        newOffer.surcharge = currentFringesPrice > 0 ? (newOffer.clientPrice / currentFringesPrice - 1) * 100 : 0;
        newOffer.clientCost = round(newOffer.clientPrice * unitMultiplier);
        state.offerDetails.offers[index] = newOffer;

        return;
      }

      if (rootCategoryId !== undefined) {
        if (updatedParameter.includes('surcharge')) {
          state.offerDetails.categorySurcharge[rootCategoryId].linked = false;
          state.offerDetails.isLinkedOverallSurcharge = false;
          newOffer.isLinkedSurcharge = false;
        }
        if (newOfferData.isLinkedSurcharge === false) {
          state.offerDetails.categorySurcharge[rootCategoryId].linked = false;
        }
      }

      const fringesPrice = calcBasePrice(newOffer.price, newOffer.overtime || 0, fringes);
      newOffer.taxPrice = fringesPrice;
      newOffer.cost = round(fringesPrice * unitMultiplier);
      const markup = newOffer.isLinkedSurcharge ? catSurcharge : newOffer.surcharge;
      newOffer.surcharge = markup;
      newOffer.clientPrice = round(fringesPrice * (1 + markup / 100));
      newOffer.clientCost = round(newOffer.clientPrice * unitMultiplier);

      state.offerDetails.offers[index] = newOffer;
    },
    changeOverallSurcharge: (
      state,
      action: PayloadAction<{
        surcharge?: number;
        linked?: boolean;
      }>
    ) => {
      const { surcharge, linked } = action.payload;
      if (linked !== undefined) {
        state.offerDetails.isLinkedOverallSurcharge = linked;
      }
      if (surcharge !== undefined || linked !== undefined) {
        const newSurcharge = surcharge ?? state.offerDetails.overallSurcharge;
        state.offerDetails.overallSurcharge = newSurcharge;
        if (state.offerDetails.isLinkedOverallSurcharge) {
          Object.keys(state.offerDetails.categorySurcharge).forEach((categoryId) => {
            state.offerDetails.categorySurcharge[categoryId].surcharge = newSurcharge;
            state.offerDetails.categorySurcharge[categoryId].linked = true;
          });
          state.offerDetails.offers.forEach((offer) => {
            const unitMultiplier = offer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
            const fringes = getEffectiveFringes(offer, state);
            const fringesPrice = calcBasePrice(offer.price, offer.overtime || 0, fringes);

            offer.surcharge = newSurcharge;
            offer.taxPrice = fringesPrice;
            offer.cost = round(fringesPrice * unitMultiplier);
            offer.clientPrice = round(fringesPrice * (1 + newSurcharge / 100));
            offer.clientCost = round(offer.clientPrice * unitMultiplier);
            offer.isLinkedSurcharge = true;
          });
        }
      }
    },
    changeCategorySurcharge: (
      state,
      action: PayloadAction<{
        categoryId: string;
        surcharge?: number;
        linked?: boolean;
      }>
    ) => {
      const { categoryId, ...newData } = action.payload;
      const lastData = state.offerDetails.categorySurcharge[categoryId];
      const newCategorySurcharge = { ...lastData, ...newData };
      if (newData.surcharge !== undefined) {
        state.offerDetails.isLinkedOverallSurcharge = false;
      }
      state.offerDetails.categorySurcharge[categoryId] = newCategorySurcharge;
      const currentCategories = state.dictionary.category
        .filter((category) => category.id === categoryId || category.parentCategoryId === categoryId)
        .map((category) => category.id);

      state.offerDetails.offers.forEach((offer) => {
        if (currentCategories.includes(offer.categoryId)) {
          if (newData.linked !== undefined) {
            offer.isLinkedSurcharge = newData.linked;
          }

          if (newData.linked || offer.isLinkedSurcharge) {
            const unitMultiplier = offer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
            const fringes = getEffectiveFringes(offer, state);
            const { surcharge = 0 } = newCategorySurcharge;
            const fringesPrice = calcBasePrice(offer.price, offer.overtime || 0, fringes);

            offer.surcharge = surcharge;
            offer.taxPrice = fringesPrice;
            offer.cost = round(fringesPrice * unitMultiplier);
            offer.clientPrice = round(fringesPrice * (1 + surcharge / 100));
            offer.clientCost = round(offer.clientPrice * unitMultiplier);
          }
        }
      });
    },
    changeUnforeseenExpenses: (state, action: PayloadAction<Partial<UnforeseenExpenses>>) => {
      state.offerDetails.unforeseenExpenses = {
        ...state.offerDetails.unforeseenExpenses,
        ...action.payload,
      };
    },
    recalculateAllOffers: (state) => {
      state.offerDetails.offers.forEach((offer) => {
        const unitMultiplier = offer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
        const fringes = getEffectiveFringes(offer, state);
        const fringesPrice = calcBasePrice(offer.price, offer.overtime || 0, fringes);

        offer.taxPrice = fringesPrice;
        offer.cost = round(fringesPrice * unitMultiplier);
        offer.clientPrice = round(fringesPrice * (1 + offer.surcharge / 100));
        offer.clientCost = round(offer.clientPrice * unitMultiplier);
      });
    },
    changeShowCostPerVideo: (state, action: PayloadAction<boolean>) => {
      state.offerDetails.showCostPerVideo = action.payload;
    },
    addDictionaryCategory: (state, action: PayloadAction<Category[]>) => {
      state.dictionary.category = action.payload;
    },
    addDictionaryEntry: (state, action: PayloadAction<Entry[]>) => {
      state.dictionary.entry = action.payload;
    },
    setExternal: (state, action: PayloadAction<boolean>) => {
      state.external = action.payload;
      if (action.payload) {
        state.dictionary.category = CATEGORIES;
        state.dictionary.entry = ENTRIES;
      }
    },
    setTemplateId: (state, action: PayloadAction<string | null>) => {
      state.templateId = action.payload;
    },
    setCategoryExternalMarkup: (
      state,
      action: PayloadAction<{
        categoryId: string;
        enabled?: boolean;
        percent?: number;
        name?: string;
      }>
    ) => {
      const { categoryId, ...updates } = action.payload;
      if (!state.offerDetails.categoryExternalMarkup) {
        state.offerDetails.categoryExternalMarkup = {};
      }
      const current: CategoryExternalMarkup = state.offerDetails.categoryExternalMarkup[categoryId] || {
        enabled: false,
        percent: parseFloat(state.metaData?.markupPercent || '0') || 0,
        name: 'Markup',
      };
      state.offerDetails.categoryExternalMarkup[categoryId] = { ...current, ...updates };
    },
    setCustomFeeName: (
      state,
      action: PayloadAction<{ feeKey: string; name: string }>
    ) => {
      if (!state.offerDetails.customFeeNames) {
        state.offerDetails.customFeeNames = {};
      }
      state.offerDetails.customFeeNames[action.payload.feeKey] = action.payload.name;
    },
    resetOffer: (state) => {
      state.offerDetails = initialState.offerDetails;
      state.metaData = initialState.metaData;
      state.external = initialState.external;
      state.templateId = initialState.templateId;
    },
  },
});

export const {
  setMetaData,
  setOfferDetails,
  addDictionaryCategory,
  addDictionaryEntry,
  addOfferRow,
  removeOfferRow,
  changeOfferRow,
  changeCategorySurcharge,
  changeUnforeseenExpenses,
  recalculateAllOffers,
  changeShowCostPerVideo,
  setExternal,
  changeOverallSurcharge,
  setCategoryExternalMarkup,
  setCustomFeeName,
  setTemplateId,
  resetOffer,
} = offerSlice.actions;
