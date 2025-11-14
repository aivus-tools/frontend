import { applyPercentage, round } from '@/lib/utils';
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
    removeOfferRow: (state, action: PayloadAction<string>) => {
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

      if (index === -1) {
        return;
      }

      const newOffer = { ...state.offerDetails.offers[index], ...newOfferData };

      const updatedParameter = Object.keys(newOfferData).filter((key): key is keyof OfferData => key in newOffer);

      if (updatedParameter.includes('showTax') && updatedParameter.length === 1) {
        state.offerDetails.offers[index] = newOffer;

        return;
      }

      if (updatedParameter.includes('taxPrice') && updatedParameter.length === 1) {
        newOffer.taxRate = (newOffer.taxPrice / newOffer.price - 1) * 100;
        state.offerDetails.offers[index] = newOffer;

        return;
      }

      if (updatedParameter.includes('clientPrice') && updatedParameter.length === 1) {
        newOffer.surcharge = ((newOffer.clientPrice - newOffer.price) * 100) / newOffer.cost;
        state.offerDetails.offers[index] = newOffer;

        return;
      }

      const unitMultiplier = newOffer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
      const { price = 0 } = newOffer;
      const category = state.dictionary.category.find((cat) => cat.id === newOffer.categoryId);
      const rootCategoryId = category?.parentCategoryId ?? category?.id;
      const { linked = false, surcharge = 0 } = state.offerDetails.categorySurcharge[rootCategoryId ?? 0] ?? {};

      newOffer.cost = price * unitMultiplier;
      newOffer.taxPrice = round(newOffer.price * (1 + newOffer.taxRate / 100));
      const markup = linked ? surcharge : newOffer.surcharge;
      newOffer.clientPrice = round(newOffer.taxPrice * (1 + markup / 100));
      newOffer.clientCost = round(newOffer.clientPrice * unitMultiplier);

      if (newOfferData.surcharge !== undefined) {
        if (rootCategoryId !== undefined) {
          state.offerDetails.categorySurcharge[rootCategoryId].linked = false;
        }
      }

      state.offerDetails.offers[index] = newOffer;
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
        newCategorySurcharge.linked = true;
      }

      state.offerDetails.categorySurcharge[categoryId] = newCategorySurcharge;
      if (newCategorySurcharge.linked) {
        const currentCategories = state.dictionary.category
          .filter((category) => category.id === categoryId || category.parentCategoryId === categoryId)
          .map((category) => category.id);
        state.offerDetails.offers.forEach((offer) => {
          if (currentCategories.includes(offer.categoryId)) {
            const unitMultiplier = offer.units?.reduce((acc, unit) => acc * (unit?.count ?? 1), 1) ?? 1;
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
} = offerSlice.actions;
