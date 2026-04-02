import { describe, it, expect, vi } from 'vitest';
import { OfferData, UnitType } from '@/types/estimation.interface';
import { OfferDetails, OfferState } from '@/types/store.interface';
import {
  offerSlice,
  setMetaData,
  setOfferDetails,
  addOfferRow,
  removeOfferRow,
  changeOfferRow,
  changeOverallSurcharge,
  changeCategorySurcharge,
  changeUnforeseenExpenses,
  recalculateAllOffers,
  changeShowCostPerVideo,
  addDictionaryCategory,
  addDictionaryEntry,
  setExternal,
  setTemplateId,
  setCategoryExternalMarkup,
  setCustomFeeName,
  resetOffer,
} from './slice';

vi.mock('@/lib/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@/modules/vendor/estimation/mock/categories', () => ({
  CATEGORIES: [{ id: 'mock-cat', name: 'Mock', level: 1 }],
}));

vi.mock('@/modules/vendor/estimation/mock/entries', () => ({
  ENTRIES: [{ id: 'mock-entry', name: 'Mock Entry' }],
}));

const reducer = offerSlice.reducer;

const createOffer = (overrides: Partial<OfferData> = {}): OfferData => ({
  id: 'offer-1',
  entryId: 'entry-1',
  categoryId: 'cat-1',
  item: 'Camera Operator',
  price: 500,
  units: [
    { type: UnitType.QUANTITY, label: 'Person', value: 'person', count: 2 },
    { type: UnitType.TIME, label: 'Day', value: 'day', count: 3 },
  ],
  taxRate: 0,
  taxPrice: 0,
  showTax: false,
  overtime: 0,
  cost: 0,
  surcharge: 0,
  isLinkedSurcharge: true,
  clientPrice: 0,
  clientCost: 0,
  marketRange: '',
  options: {
    [UnitType.TIME]: [],
    [UnitType.QUANTITY]: [],
  },
  ...overrides,
});

const createInitialState = (overrides: Partial<OfferState> = {}): OfferState => ({
  offerDetails: {
    offers: [],
    categories: [],
    subCategories: [],
    categorySurcharge: {},
    categoryExternalMarkup: {},
    customFeeNames: {},
    unforeseenExpenses: { percent: 0, isVisible: true },
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
  ...overrides,
});

describe('offerSlice', () => {
  describe('setMetaData', () => {
    it('sets metadata', () => {
      const state = createInitialState();
      const meta = { id: 'o1', status: 'DRAFT' } as OfferState['metaData'];
      const next = reducer(state, setMetaData(meta));
      expect(next.metaData).toBe(meta);
    });

    it('clears metadata when null', () => {
      const state = createInitialState({ metaData: { id: 'o1' } as OfferState['metaData'] });
      const next = reducer(state, setMetaData(null));
      expect(next.metaData).toBeNull();
    });
  });

  describe('setOfferDetails', () => {
    it('sets offer details', () => {
      const state = createInitialState();
      const details: OfferDetails = {
        offers: [],
        categories: [],
        subCategories: [],
        categorySurcharge: {},
        categoryExternalMarkup: {},
        customFeeNames: {},
        unforeseenExpenses: { percent: 5, isVisible: true },
        showCostPerVideo: false,
        overallSurcharge: 10,
        isLinkedOverallSurcharge: true,
      };
      const next = reducer(state, setOfferDetails(details));
      expect(next.offerDetails.unforeseenExpenses.percent).toBe(5);
      expect(next.offerDetails.showCostPerVideo).toBe(false);
      expect(next.offerDetails.overallSurcharge).toBe(10);
    });

    it('auto-calculates cost for offers with price but zero cost', () => {
      const state = createInitialState();
      const offer = createOffer({ price: 100, cost: 0 });
      const details: OfferDetails = {
        offers: [offer],
        categories: [],
        subCategories: [],
        categorySurcharge: {},
        categoryExternalMarkup: {},
        customFeeNames: {},
        unforeseenExpenses: { percent: 0, isVisible: true },
        showCostPerVideo: true,
        overallSurcharge: 0,
        isLinkedOverallSurcharge: false,
      };
      const next = reducer(state, setOfferDetails(details));
      expect(next.offerDetails.offers[0].cost).toBeGreaterThan(0);
    });

    it('defaults missing arrays to empty', () => {
      const state = createInitialState();
      const details = {
        unforeseenExpenses: { percent: 0, isVisible: true },
        showCostPerVideo: true,
        overallSurcharge: 0,
        isLinkedOverallSurcharge: false,
      } as unknown as OfferDetails;
      const next = reducer(state, setOfferDetails(details));
      expect(next.offerDetails.offers).toEqual([]);
      expect(next.offerDetails.categories).toEqual([]);
    });
  });

  describe('addOfferRow', () => {
    it('adds offer to list', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'cat-1', name: 'Production', level: 1 }],
          entry: [],
        },
      });
      const offer = createOffer();
      const next = reducer(state, addOfferRow(offer));
      expect(next.offerDetails.offers.length).toBe(1);
      expect(next.offerDetails.offers[0].id).toBe('offer-1');
    });

    it('adds parent category automatically', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'cat-1', name: 'Production', level: 1 }],
          entry: [],
        },
      });
      const offer = createOffer({ categoryId: 'cat-1' });
      const next = reducer(state, addOfferRow(offer));
      expect(next.offerDetails.categories.length).toBe(1);
      expect(next.offerDetails.categories[0].id).toBe('cat-1');
    });

    it('adds subcategory and parent category', () => {
      const state = createInitialState({
        dictionary: {
          category: [
            { id: 'parent-1', name: 'Production', level: 1 },
            { id: 'sub-1', name: 'Crew', level: 2, parentCategoryId: 'parent-1' },
          ],
          entry: [],
        },
      });
      const offer = createOffer({ categoryId: 'sub-1' });
      const next = reducer(state, addOfferRow(offer));
      expect(next.offerDetails.categories.length).toBe(1);
      expect(next.offerDetails.categories[0].id).toBe('parent-1');
      expect(next.offerDetails.subCategories.length).toBe(1);
      expect(next.offerDetails.subCategories[0].id).toBe('sub-1');
    });

    it('calculates cost based on units', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'cat-1', name: 'Production', level: 1 }],
          entry: [],
        },
      });
      const offer = createOffer({
        price: 100,
        units: [
          { type: UnitType.QUANTITY, label: 'Person', value: 'person', count: 2 },
          { type: UnitType.TIME, label: 'Day', value: 'day', count: 3 },
        ],
      });
      const next = reducer(state, addOfferRow(offer));
      expect(next.offerDetails.offers[0].cost).toBe(600);
    });

    it('does nothing when category not found', () => {
      const state = createInitialState();
      const offer = createOffer({ categoryId: 'nonexistent' });
      const next = reducer(state, addOfferRow(offer));
      expect(next.offerDetails.offers.length).toBe(0);
    });
  });

  describe('removeOfferRow', () => {
    it('removes offer by id', () => {
      const state = createInitialState();
      state.offerDetails.offers = [createOffer({ id: 'o1' }), createOffer({ id: 'o2' })];
      const next = reducer(state, removeOfferRow('o1'));
      expect(next.offerDetails.offers.length).toBe(1);
      expect(next.offerDetails.offers[0].id).toBe('o2');
    });

    it('cleans up unused categories', () => {
      const state = createInitialState();
      state.offerDetails.offers = [createOffer({ id: 'o1', categoryId: 'cat-1' })];
      state.offerDetails.categories = [{ id: 'cat-1', name: 'Production', level: 1 }];
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 10, linked: true } };
      const next = reducer(state, removeOfferRow('o1'));
      expect(next.offerDetails.categories.length).toBe(0);
      expect(next.offerDetails.categorySurcharge).toEqual({});
    });

    it('does nothing for nonexistent id', () => {
      const state = createInitialState();
      state.offerDetails.offers = [createOffer()];
      const next = reducer(state, removeOfferRow('nonexistent'));
      expect(next.offerDetails.offers.length).toBe(1);
    });
  });

  describe('changeOfferRow', () => {
    it('updates price and recalculates', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'cat-1', name: 'Production', level: 1 }],
          entry: [],
        },
      });
      state.offerDetails.offers = [
        createOffer({
          id: 'o1',
          price: 100,
          cost: 600,
          units: [
            { type: UnitType.QUANTITY, label: 'P', value: 'p', count: 2 },
            { type: UnitType.TIME, label: 'D', value: 'd', count: 3 },
          ],
        }),
      ];
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 0, linked: true } };
      const next = reducer(state, changeOfferRow({ id: 'o1', price: 200 }));
      expect(next.offerDetails.offers[0].price).toBe(200);
      expect(next.offerDetails.offers[0].cost).toBe(1200);
    });

    it('updates taxPrice directly', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'cat-1', name: 'Production', level: 1 }],
          entry: [],
        },
      });
      state.offerDetails.offers = [
        createOffer({
          id: 'o1',
          price: 100,
          taxPrice: 100,
          cost: 600,
          units: [
            { type: UnitType.QUANTITY, label: 'P', value: 'p', count: 2 },
            { type: UnitType.TIME, label: 'D', value: 'd', count: 3 },
          ],
        }),
      ];
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 0, linked: true } };
      const next = reducer(state, changeOfferRow({ id: 'o1', taxPrice: 150 }));
      expect(next.offerDetails.offers[0].taxPrice).toBe(150);
      expect(next.offerDetails.offers[0].cost).toBe(900);
    });

    it('does nothing for nonexistent id', () => {
      const state = createInitialState();
      state.offerDetails.offers = [createOffer({ id: 'o1', price: 100 })];
      const next = reducer(state, changeOfferRow({ id: 'nonexistent', price: 999 }));
      expect(next.offerDetails.offers[0].price).toBe(100);
    });
  });

  describe('changeOverallSurcharge', () => {
    it('updates surcharge value', () => {
      const state = createInitialState();
      const next = reducer(state, changeOverallSurcharge({ surcharge: 15 }));
      expect(next.offerDetails.overallSurcharge).toBe(15);
    });

    it('propagates when linked', () => {
      const state = createInitialState();
      state.offerDetails.isLinkedOverallSurcharge = true;
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 0, linked: true } };
      state.offerDetails.offers = [createOffer({ id: 'o1', price: 100, surcharge: 0, isLinkedSurcharge: true })];
      const next = reducer(state, changeOverallSurcharge({ surcharge: 20 }));
      expect(next.offerDetails.categorySurcharge['cat-1'].surcharge).toBe(20);
      expect(next.offerDetails.offers[0].surcharge).toBe(20);
    });

    it('sets linked flag', () => {
      const state = createInitialState();
      const next = reducer(state, changeOverallSurcharge({ linked: true }));
      expect(next.offerDetails.isLinkedOverallSurcharge).toBe(true);
    });
  });

  describe('changeCategorySurcharge', () => {
    it('updates category surcharge', () => {
      const state = createInitialState();
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 0, linked: true } };
      const next = reducer(state, changeCategorySurcharge({ categoryId: 'cat-1', surcharge: 25 }));
      expect(next.offerDetails.categorySurcharge['cat-1'].surcharge).toBe(25);
    });

    it('unlinks overall surcharge when setting category-specific', () => {
      const state = createInitialState();
      state.offerDetails.isLinkedOverallSurcharge = true;
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 0, linked: true } };
      const next = reducer(state, changeCategorySurcharge({ categoryId: 'cat-1', surcharge: 10 }));
      expect(next.offerDetails.isLinkedOverallSurcharge).toBe(false);
    });
  });

  describe('changeUnforeseenExpenses', () => {
    it('updates percent', () => {
      const state = createInitialState();
      const next = reducer(state, changeUnforeseenExpenses({ percent: 5 }));
      expect(next.offerDetails.unforeseenExpenses.percent).toBe(5);
    });

    it('updates visibility', () => {
      const state = createInitialState();
      const next = reducer(state, changeUnforeseenExpenses({ isVisible: false }));
      expect(next.offerDetails.unforeseenExpenses.isVisible).toBe(false);
    });
  });

  describe('recalculateAllOffers', () => {
    it('recalculates all offer costs', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'cat-1', name: 'Production', level: 1 }],
          entry: [],
        },
      });
      state.offerDetails.categorySurcharge = { 'cat-1': { surcharge: 10, linked: true } };
      state.offerDetails.offers = [
        createOffer({
          id: 'o1',
          price: 100,
          cost: 0,
          surcharge: 10,
          isLinkedSurcharge: true,
          units: [
            { type: UnitType.QUANTITY, label: 'P', value: 'p', count: 1 },
            { type: UnitType.TIME, label: 'D', value: 'd', count: 1 },
          ],
        }),
      ];
      const next = reducer(state, recalculateAllOffers());
      expect(next.offerDetails.offers[0].cost).toBe(100);
      expect(next.offerDetails.offers[0].clientPrice).toBe(110);
    });
  });

  describe('changeShowCostPerVideo', () => {
    it('toggles show cost per video', () => {
      const state = createInitialState();
      const next = reducer(state, changeShowCostPerVideo(false));
      expect(next.offerDetails.showCostPerVideo).toBe(false);
    });
  });

  describe('addDictionaryCategory', () => {
    it('sets dictionary categories', () => {
      const state = createInitialState();
      const cats = [{ id: 'c1', name: 'Cat 1', level: 1 }];
      const next = reducer(state, addDictionaryCategory(cats));
      expect(next.dictionary.category).toEqual(cats);
    });
  });

  describe('addDictionaryEntry', () => {
    it('sets dictionary entries', () => {
      const state = createInitialState();
      const entries = [{ id: 'e1', name: 'Entry 1' }] as any;
      const next = reducer(state, addDictionaryEntry(entries));
      expect(next.dictionary.entry).toEqual(entries);
    });
  });

  describe('setExternal', () => {
    it('sets external flag and loads mock data', () => {
      const state = createInitialState();
      const next = reducer(state, setExternal(true));
      expect(next.external).toBe(true);
      expect(next.dictionary.category.length).toBeGreaterThan(0);
    });

    it('does not load mock data when false', () => {
      const state = createInitialState();
      const next = reducer(state, setExternal(false));
      expect(next.external).toBe(false);
      expect(next.dictionary.category.length).toBe(0);
    });
  });

  describe('setTemplateId', () => {
    it('sets template id', () => {
      const state = createInitialState();
      const next = reducer(state, setTemplateId('tmpl-1'));
      expect(next.templateId).toBe('tmpl-1');
    });

    it('clears template id', () => {
      const state = createInitialState({ templateId: 'tmpl-1' });
      const next = reducer(state, setTemplateId(null));
      expect(next.templateId).toBeNull();
    });
  });

  describe('setCategoryExternalMarkup', () => {
    it('sets external markup for category', () => {
      const state = createInitialState();
      const next = reducer(
        state,
        setCategoryExternalMarkup({
          categoryId: 'cat-1',
          enabled: true,
          percent: 15,
          name: 'Agency Fee',
        })
      );
      expect(next.offerDetails.categoryExternalMarkup['cat-1']).toEqual({
        enabled: true,
        percent: 15,
        name: 'Agency Fee',
      });
    });

    it('merges with existing markup', () => {
      const state = createInitialState();
      state.offerDetails.categoryExternalMarkup = {
        'cat-1': { enabled: false, percent: 10, name: 'Markup' },
      };
      const next = reducer(
        state,
        setCategoryExternalMarkup({
          categoryId: 'cat-1',
          enabled: true,
        })
      );
      expect(next.offerDetails.categoryExternalMarkup['cat-1'].enabled).toBe(true);
      expect(next.offerDetails.categoryExternalMarkup['cat-1'].percent).toBe(10);
    });
  });

  describe('setCustomFeeName', () => {
    it('sets custom fee name', () => {
      const state = createInitialState();
      const next = reducer(state, setCustomFeeName({ feeKey: 'markup', name: 'Agency Markup' }));
      expect(next.offerDetails.customFeeNames['markup']).toBe('Agency Markup');
    });
  });

  describe('resetOffer', () => {
    it('resets to initial state', () => {
      const state = createInitialState({
        metaData: { id: 'o1' } as any,
        external: true,
        templateId: 'tmpl-1',
      });
      state.offerDetails.offers = [createOffer()];
      const next = reducer(state, resetOffer());
      expect(next.offerDetails.offers).toEqual([]);
      expect(next.metaData).toBeNull();
      expect(next.external).toBe(false);
      expect(next.templateId).toBeNull();
    });

    it('preserves dictionary', () => {
      const state = createInitialState({
        dictionary: {
          category: [{ id: 'c1', name: 'Cat', level: 1 }],
          entry: [],
        },
      });
      const next = reducer(state, resetOffer());
      expect(next.dictionary.category.length).toBe(1);
    });
  });
});
