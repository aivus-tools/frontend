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
  selectCategoryFees,
  selectAllCategoryFeesTotal,
} from './selectors';
import { OfferState } from '@/types/store.interface';

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
      expect(result.value).toBe(800);
      expect(result.formatted).toBe('$800.00');
    });

    it('should calculate client total sum correctly', () => {
      const state = createMockState();
      const result = selectClientTotalSum(state);
      expect(result.value).toBe(1200);
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
      expect(result.total).toBe('$80.00');
    });

    it('should handle zero percent', () => {
      const state = createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          unforeseenExpenses: { percent: 0, isVisible: true },
        },
      });
      const result = selectUnforeseenExpenses(state);

      expect(result.total).toBe('$0.00');
    });

    it('should handle invisible unforeseen expenses', () => {
      const state = createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          unforeseenExpenses: { percent: 10, isVisible: false },
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

      expect(result.totalValue).toBe(880);
      expect(result.clientTotalValue).toBe(1200);
      expect(result.total).toBe('$880.00');
      expect(result.clientTotal).toBe('$1,200.00');
    });

    it('should calculate grand total without unforeseen expenses when not visible', () => {
      const state = createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          unforeseenExpenses: { percent: 10, isVisible: false },
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

      expect(result.total).toBe('$300.00');
      expect(result.clientTotal).toBe('$450.00');
    });

    it('should calculate total for category without subcategories', () => {
      const state = createMockState();
      const result = selectTotalSumByCategoryId(state, 'cat-2');

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

      expect(result.vendor).toBe(176);
      expect(result.client).toBe(240);
    });

    it('should handle single video', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 1);

      expect(result.vendor).toBe(880);
      expect(result.client).toBe(1200);
    });

    it('should handle zero count as 1', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 0);

      expect(result.vendor).toBe(880);
      expect(result.client).toBe(1200);
    });

    it('should handle decimal counts', () => {
      const state = createMockState();
      const selector = makeSelectCostPerVideo();
      const result = selector(state, 2.5);

      expect(result.vendor).toBe(352);
      expect(result.client).toBe(480);
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
        expect(preProduction.data).toHaveLength(2);
        expect(preProduction.data[0].subcategory).toBe('Pre-Production');
        expect(preProduction.data[1].subcategory).toBe('Research');
      }
    });

    it('should filter out undefined units in export data', () => {
      const state = createMockState();
      const result = selectCategoriesExportData(state);

      const category = result.find((cat) => cat.category === 'Pre-Production');
      if (category && 'data' in category && Array.isArray(category.data)) {
        const items = category.data[0].items;
        expect(items).toHaveLength(1);
      }
    });
  });

  describe('Fee logic', () => {
    const createFeeState = (overrides?: Partial<OfferState>) => {
      return createMockState({
        offerDetails: {
          ...createMockState().offer.offerDetails,
          categories: [
            { id: 'cat-prod', name: 'Production', parentCategoryId: null, tags: ['production'] },
            { id: 'cat-post', name: 'Post-Production', parentCategoryId: null, tags: ['post_production'] },
          ],
          subCategories: [],
          offers: [
            { id: 'o1', categoryId: 'cat-prod', item: 'Crew', cost: 1000, clientCost: 1200, price: 1000, clientPrice: 1200, units: [] },
            { id: 'o2', categoryId: 'cat-post', item: 'Edit', cost: 500, clientCost: 600, price: 500, clientPrice: 600, units: [] },
          ],
          categorySurcharge: {
            'cat-prod': { surcharge: 20, linked: false },
            'cat-post': { surcharge: 20, linked: false },
          },
          ...overrides?.offerDetails,
        } as OfferState['offerDetails'],
        metaData: {
          projectName: 'Test',
          clientName: 'Client',
          productionInsurancePercent: '3',
          productionFeePercent: '20',
          postInsurancePercent: '2',
          postMarkupPercent: '15',
          postTaxPercent: '5',
        } as unknown as OfferState['metaData'],
        ...overrides,
      });
    };

    it('should calculate production fees with insurance and fee', () => {
      const state = createFeeState();
      const fees = selectCategoryFees(state, 'cat-prod');

      expect(fees).toHaveLength(2);
      expect(fees[0].key).toBe('PROD_INSURANCE');
      expect(fees[0].percent).toBe(3);
      expect(fees[0].vendorAmount).toBe(30);
      expect(fees[0].clientAmount).toBe(36);
      expect(fees[1].key).toBe('PROD_FEE');
      expect(fees[1].percent).toBe(20);
      expect(fees[1].vendorAmount).toBe(200);
      expect(fees[1].clientAmount).toBe(240);
    });

    it('should calculate post-production fees', () => {
      const state = createFeeState();
      const fees = selectCategoryFees(state, 'cat-post');

      expect(fees).toHaveLength(3);
      expect(fees[0].key).toBe('POST_INSURANCE');
      expect(fees[1].key).toBe('POST_MARKUP');
      expect(fees[2].key).toBe('POST_TAX');
    });

    it('should suppress PROD_FEE when EXT_MARKUP is enabled', () => {
      const state = createFeeState({
        offerDetails: {
          ...createFeeState().offer.offerDetails,
          categoryExternalMarkup: {
            'cat-prod': { enabled: true, percent: 25, name: 'Agency Fee' },
          },
        } as OfferState['offerDetails'],
      });
      const fees = selectCategoryFees(state, 'cat-prod');

      const feeKeys = fees.map((x) => x.key);
      expect(feeKeys).toContain('PROD_INSURANCE');
      expect(feeKeys).not.toContain('PROD_FEE');
      expect(feeKeys).toContain('EXT_MARKUP_cat-prod');
    });

    it('should suppress POST_MARKUP when EXT_MARKUP is enabled', () => {
      const state = createFeeState({
        offerDetails: {
          ...createFeeState().offer.offerDetails,
          categoryExternalMarkup: {
            'cat-post': { enabled: true, percent: 10, name: 'Agency Fee' },
          },
        } as OfferState['offerDetails'],
      });
      const fees = selectCategoryFees(state, 'cat-post');

      const feeKeys = fees.map((x) => x.key);
      expect(feeKeys).toContain('POST_INSURANCE');
      expect(feeKeys).not.toContain('POST_MARKUP');
      expect(feeKeys).toContain('POST_TAX');
      expect(feeKeys).toContain('EXT_MARKUP_cat-post');
    });

    it('should calculate EXT_MARKUP vendorAmount', () => {
      const state = createFeeState({
        offerDetails: {
          ...createFeeState().offer.offerDetails,
          categoryExternalMarkup: {
            'cat-prod': { enabled: true, percent: 20, name: 'Markup' },
          },
        } as OfferState['offerDetails'],
      });
      const fees = selectCategoryFees(state, 'cat-prod');
      const extFee = fees.find((x) => x.key === 'EXT_MARKUP_cat-prod');

      expect(extFee).toBeDefined();
      expect(extFee!.vendorAmount).toBe(200);
      expect(extFee!.clientAmount).toBe(240);
    });

    it('should sum all category fees correctly', () => {
      const state = createFeeState();
      const totals = selectAllCategoryFeesTotal(state);

      expect(totals.vendorTotal).toBeGreaterThan(0);
      expect(totals.clientTotal).toBeGreaterThan(0);
    });

    it('should exclude vendor fees from grand total', () => {
      const state = createFeeState();
      const grandTotal = selectGrandTotal(state);
      const totalSum = selectTotalSum(state);

      expect(grandTotal.totalValue).toBe(
        totalSum.value + totalSum.value * 0.1
      );
    });

    it('should return empty fees for category without tags', () => {
      const state = createMockState();
      const fees = selectCategoryFees(state, 'cat-1');

      expect(fees).toHaveLength(0);
    });
  });
});
