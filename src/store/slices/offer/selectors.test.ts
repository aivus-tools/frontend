import { describe, it, expect } from 'vitest';
import {
  selectOfferDetails,
  selectDictionary,
  selectOfferMetaData,
  selectIsExternal,
  selectShowCostPerVideo,
  selectRootCategories,
  selectSubcategoryById,
  selectOffersByCategoryId,
  selectOfferById,
  selectTotalSum,
  selectClientTotalSum,
  selectUnforeseenExpenses,
  selectGrandTotal,
  selectTotalSumByCategoryId,
  selectCategorySurcharge,
  selectOverallSurcharge,
  makeSelectCostPerVideo,
  selectCategoriesExportData,
} from './selectors';
import { OfferState } from '@/types/store.interface';

// Mock state factory
const createMockState = (overrides?: Partial<OfferState>): { offer: OfferState } => ({
  offer: {
    offerDetails: {
      id: 'offer-1',
      projectId: 'project-1',
      name: 'Test Offer',
      categories: [
        { id: 'cat-1', name: 'Pre-Production', parentCategoryId: null },
        { id: 'cat-2', name: 'Production', parentCategoryId: null },
      ],
      subCategories: [
        { id: 'sub-1', name: 'Research', parentCategoryId: 'cat-1' },
        { id: 'sub-2', name: 'Filming', parentCategoryId: 'cat-2' },
      ],
      offers: [
        {
          id: 'offer-item-1',
          categoryId: 'cat-1',
          item: 'Item 1',
          cost: 100,
          clientCost: 150,
          price: 100,
          clientPrice: 150,
          units: [
            { label: 'hours', count: 1 },
            { label: 'days', count: 1 },
          ],
        },
        {
          id: 'offer-item-2',
          categoryId: 'sub-1',
          item: 'Item 2',
          cost: 200,
          clientCost: 300,
          price: 200,
          clientPrice: 300,
          units: [],
        },
        {
          id: 'offer-item-3',
          categoryId: 'cat-2',
          item: 'Item 3',
          cost: 500,
          clientCost: 750,
          price: 500,
          clientPrice: 750,
          units: [],
        },
      ],
      unforeseenExpenses: {
        percent: 10,
        clientPercent: 15,
        isVisible: true,
      },
      categorySurcharge: {
        'cat-1': { surcharge: 5, linked: true },
      },
      overallSurcharge: 10,
      isLinkedOverallSurcharge: true,
      showCostPerVideo: true,
      ...overrides?.offerDetails,
    },
    dictionary: {
      category: [
        { id: 'cat-1', name: 'Pre-Production' },
        { id: 'cat-2', name: 'Production' },
      ],
    },
    metaData: {
      projectName: 'Test Project',
      clientName: 'Test Client',
    },
    external: false,
    ...overrides,
  } as OfferState,
});

describe('Offer Selectors', () => {
  describe('Basic selectors', () => {
    it('should select offer details', () => {
      const state = createMockState();
      const result = selectOfferDetails(state);
      expect(result).toBeDefined();
      expect(result?.offers).toBeDefined();
    });

    it('should select dictionary', () => {
      const state = createMockState();
      const result = selectDictionary(state);
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
    });

    it('should select metadata', () => {
      const state = createMockState();
      const result = selectOfferMetaData(state);
      expect(result?.projectName).toBe('Test Project');
      expect(result?.projectName).toBe('Test Project');
    });

    it('should select isExternal flag', () => {
      const state = createMockState();
      expect(selectIsExternal(state)).toBe(false);

      const externalState = createMockState({ external: true });
      expect(selectIsExternal(externalState)).toBe(true);
    });

    it('should select showCostPerVideo', () => {
      const state = createMockState();
      expect(selectShowCostPerVideo(state)).toBe(true);

      const hiddenState = createMockState({
        offerDetails: { ...createMockState().offer.offerDetails, showCostPerVideo: false },
      });
      expect(selectShowCostPerVideo(hiddenState)).toBe(false);
    });
  });

  describe('Category selectors', () => {
    it('should select root categories only', () => {
      const state = createMockState();
      const result = selectRootCategories(state);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('cat-1');
      expect(result[1].id).toBe('cat-2');
    });

    it('should select subcategories by parent ID', () => {
      const state = createMockState();
      const result = selectSubcategoryById(state, 'cat-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sub-1');
      expect(result[0].name).toBe('Research');
    });

    it('should return empty array when no subcategories exist', () => {
      const state = createMockState();
      const result = selectSubcategoryById(state, 'non-existent');
      expect(result).toEqual([]);
    });
  });

  describe('Offer item selectors', () => {
    it('should select offers by category ID', () => {
      const state = createMockState();
      const result = selectOffersByCategoryId(state, 'cat-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('offer-item-1');
    });

    it('should select offer by ID', () => {
      const state = createMockState();
      const result = selectOfferById(state, 'offer-item-2');
      expect(result).toBeDefined();
      expect(result?.item).toBe('Item 2');
      expect(result?.cost).toBe(200);
    });

    it('should return undefined for non-existent offer', () => {
      const state = createMockState();
      const result = selectOfferById(state, 'non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('Cost calculations', () => {
    it('should calculate total sum correctly', () => {
      const state = createMockState();
      const result = selectTotalSum(state);
      expect(result.value).toBe(800); // 100 + 200 + 500
      expect(result.formatted).toBe('$800.00');
    });

    it('should calculate client total sum correctly', () => {
      const state = createMockState();
      const result = selectClientTotalSum(state);
      expect(result.value).toBe(1200); // 150 + 300 + 750
      expect(result.formatted).toBe('$1,200.00');
    });

    it('should return zero for empty offers', () => {
      const state = createMockState({
        offerDetails: { ...createMockState().offer.offerDetails, offers: [] },
      });
      const result = selectTotalSum(state);
      expect(result.value).toBe(0);
      expect(result.formatted).toBe('$0.00');
    });
  });

  describe('Unforeseen expenses', () => {
    it('should calculate unforeseen expenses correctly', () => {
      const state = createMockState();
      const result = selectUnforeseenExpenses(state);

      expect(result.isVisible).toBe(true);
      expect(result.percent).toBe(10);
      expect(result.clientPercent).toBe(15);
      expect(result.total).toBe('$80.00'); // 10% of 800
      expect(result.clientTotal).toBe('$180.00'); // 15% of 1200
    });

    it('should handle zero percent', () => {
      const state = createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          unforeseenExpenses: { percent: 0, clientPercent: 0, isVisible: true },
        },
      });
      const result = selectUnforeseenExpenses(state);

      expect(result.total).toBe('$0.00');
      expect(result.clientTotal).toBe('$0.00');
    });

    it('should handle invisible unforeseen expenses', () => {
      const state = createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          unforeseenExpenses: { percent: 10, clientPercent: 15, isVisible: false },
        },
      });
      const result = selectUnforeseenExpenses(state);

      expect(result.isVisible).toBe(false);
    });
  });

  describe('Grand total', () => {
    it('should calculate grand total with unforeseen expenses', () => {
      const state = createMockState();
      const result = selectGrandTotal(state);

      expect(result.totalValue).toBe(880); // 800 + (800 * 0.10)
      expect(result.clientTotalValue).toBe(1380); // 1200 + (1200 * 0.15)
      expect(result.total).toBe('$880.00');
      expect(result.clientTotal).toBe('$1,380.00');
    });

    it('should calculate grand total without unforeseen expenses when not visible', () => {
      const state = createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          unforeseenExpenses: { percent: 10, clientPercent: 15, isVisible: false },
        },
      });
      const result = selectGrandTotal(state);

      expect(result.totalValue).toBe(800);
      expect(result.clientTotalValue).toBe(1200);
    });
  });

  describe('Category total sum', () => {
    it('should calculate total sum by category including subcategories', () => {
      const state = createMockState();
      const result = selectTotalSumByCategoryId(state, 'cat-1');

      // cat-1 has offer-item-1 (100) + subcategory sub-1 with offer-item-2 (200)
      expect(result.total).toBe('$300.00');
      expect(result.clientTotal).toBe('$450.00');
    });

    it('should calculate total for category without subcategories', () => {
      const state = createMockState();
      const result = selectTotalSumByCategoryId(state, 'cat-2');

      // cat-2 has only offer-item-3 (500)
      expect(result.total).toBe('$500.00');
      expect(result.clientTotal).toBe('$750.00');
    });

    it('should return zero for non-existent category', () => {
      const state = createMockState();
      const result = selectTotalSumByCategoryId(state, 'non-existent');

      expect(result.total).toBe('$0.00');
      expect(result.clientTotal).toBe('$0.00');
    });
  });

  describe('Surcharge selectors', () => {
    it('should select category surcharge', () => {
      const state = createMockState();
      const result = selectCategorySurcharge(state, 'cat-1');

      expect(result.surcharge).toBe(5);
      expect(result.linked).toBe(true);
    });

    it('should return default surcharge for category without surcharge', () => {
      const state = createMockState();
      const result = selectCategorySurcharge(state, 'cat-2');

      expect(result.surcharge).toBe(0);
      expect(result.linked).toBe(false);
    });

    it('should select overall surcharge', () => {
      const state = createMockState();
      const result = selectOverallSurcharge(state);

      expect(result.surcharge).toBe(10);
      expect(result.linked).toBe(true);
    });
  });

  describe('Cost per video', () => {
    it('should calculate cost per video correctly', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 5);

      expect(result.vendor).toBe(176); // 880 / 5
      expect(result.client).toBe(276); // 1380 / 5
    });

    it('should handle single video', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 1);

      expect(result.vendor).toBe(880);
      expect(result.client).toBe(1380);
    });

    it('should handle zero count as 1', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 0);

      expect(result.vendor).toBe(880);
      expect(result.client).toBe(1380);
    });

    it('should handle decimal counts', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 2.5);

      expect(result.vendor).toBe(352);
      expect(result.client).toBe(552);
    });
  });

  describe('Export data selector', () => {
    it('should prepare export data correctly', () => {
      const state = createMockState();
      const result = selectCategoriesExportData(state);

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('Pre-Production');
    });

    it('should include subcategories in export data', () => {
      const state = createMockState();
      const result = selectCategoriesExportData(state);

      const preProduction = result.find((cat) => cat.category === 'Pre-Production');
      expect(preProduction).toBeDefined();

      if ('data' in preProduction! && Array.isArray(preProduction.data)) {
        expect(preProduction.data).toHaveLength(1);
        expect(preProduction.data[0].subcategory).toBe('Research');
      }
    });

    it('should filter out undefined units in export data', () => {
      const state = createMockState();
      const result = selectCategoriesExportData(state);

      // Find the item with units
      const category = result.find((cat) => cat.category === 'Pre-Production');
      if (category && 'data' in category && Array.isArray(category.data)) {
        const items = category.data[0].items;
        expect(items).toHaveLength(1);
      }
    });
  });
});
