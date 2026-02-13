import { round } from '@/lib/utils';
import { Category, OfferData, Entry } from '@/types/estimation.interface';
import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import clone from 'lodash.clone';
import { OfferDetails, OfferState, UnforeseenExpenses } from '@/types/store.interface';
import { CATEGORIES } from '@/modules/vendor/estimation/mock/categories';
import { ENTRIES } from '@/modules/vendor/estimation/mock/entries';

const initialState: OfferState = {
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
    overallSurcharge: 0,
    isLinkedOverallSurcharge: false,
  },
  metaData: null,
  dictionary: {
    category: [],
    entry: [],
  },
  external: false,
};

export const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    setOfferDetails: (state, action: PayloadAction<OfferDetails>) => {
      state.offerDetails = action.payload;
    },
    setMetaData: (state, action: PayloadAction<OfferState['metaData']>) => {
      state.metaData = action.payload;
    },
    addOfferRow: (state, action: PayloadAction<OfferData>) => {
      const tempState = clone(state);
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

      if (!tempState.offerDetails?.offers) {
        tempState.offerDetails.offers = [];
      }
      const categorySurcharge = getCategorySurcharge(category);
      tempState.offerDetails.offers.push({
        ...action.payload,
        surcharge: categorySurcharge,
      });

      // Обновляем основной state
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

      if (updatedParameter.includes('taxPrice') && updatedParameter.length === 1) {
        newOffer.taxRate = (newOffer.taxPrice / newOffer.price - 1) * 100;
        const currentTaxPrice = newOffer.showTax ? round(newOffer.price * (1 + newOffer.taxRate / 100)) : newOffer.price;
        newOffer.cost = round(currentTaxPrice * unitMultiplier);
        const markup = newOffer.isLinkedSurcharge ? catSurcharge : newOffer.surcharge;
        newOffer.clientPrice = round(currentTaxPrice * (1 + markup / 100));
        newOffer.clientCost = round(newOffer.clientPrice * unitMultiplier);
        state.offerDetails.offers[index] = newOffer;

        return;
      }

      if (updatedParameter.includes('clientPrice') && updatedParameter.length === 1) {
        const currentTaxPrice = newOffer.showTax ? round(newOffer.price * (1 + newOffer.taxRate / 100)) : newOffer.price;
        newOffer.surcharge = (newOffer.clientPrice / currentTaxPrice - 1) * 100;
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

      const taxPrice = newOffer.showTax ? round(newOffer.price * (1 + newOffer.taxRate / 100)) : newOffer.price;
      newOffer.taxPrice = round(newOffer.price * (1 + newOffer.taxRate / 100)); // Store actual taxPrice regardless of toggle
      newOffer.cost = round(taxPrice * unitMultiplier);
      const markup = newOffer.isLinkedSurcharge ? catSurcharge : newOffer.surcharge;
      newOffer.surcharge = markup;
      newOffer.clientPrice = round(taxPrice * (1 + markup / 100));
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
            const { price = 0, taxRate = 0, showTax } = offer;
            const taxPrice = showTax ? round(price * (1 + taxRate / 100)) : price;

            offer.surcharge = newSurcharge;
            offer.taxPrice = round(price * (1 + taxRate / 100));
            offer.cost = round(taxPrice * unitMultiplier);
            offer.clientPrice = round(taxPrice * (1 + newSurcharge / 100));
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
            const { price = 0, taxRate = 0, showTax } = offer;
            const { surcharge = 0 } = newCategorySurcharge;
            const taxPrice = showTax ? round(price * (1 + taxRate / 100)) : price;

            offer.surcharge = surcharge;
            offer.taxPrice = round(price * (1 + taxRate / 100));
            offer.cost = round(taxPrice * unitMultiplier);
            offer.clientPrice = round(taxPrice * (1 + surcharge / 100));
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
  changeShowCostPerVideo,
  setExternal,
  changeOverallSurcharge,
} = offerSlice.actions;
