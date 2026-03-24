import { describe, it, expect } from 'vitest';
import { computeDisplayValues, stripHtml, buildSectionFees } from './exportUtils';
import { ExportEntryItem } from '@/types/exportData.interface';

const makeEntry = (overrides: Partial<ExportEntryItem> = {}): ExportEntryItem => {
  return {
    id: '1',
    entryId: 'e1',
    code: 'A',
    name: 'Test',
    rate: 100,
    units: [{ label: 'Person', symbol: 'Person (s)', count: 2 }],
    overtime: 0,
    estimate: 200,
    ...overrides,
  };
};

describe('computeDisplayValues', () => {
  it('returns rate equal to estimate / units when no overtime', () => {
    const entry = makeEntry({ rate: 100, overtime: 0, estimate: 300, units: [{ label: 'Day', symbol: 'Days', count: 2 }] });
    const result = computeDisplayValues(entry);
    expect(result.rate).toBeCloseTo(150);
    expect(result.overtime).toBe(0);
  });

  it('preserves identity: rate * units + overtime = estimate', () => {
    const entry = makeEntry({
      rate: 100,
      overtime: 50,
      estimate: 750,
      units: [
        { label: 'Person', symbol: 'Person (s)', count: 2 },
        { label: 'Day', symbol: 'Days', count: 3 },
      ],
    });
    const result = computeDisplayValues(entry);
    const unitsProduct = 2 * 3;
    const total = result.rate * unitsProduct + result.overtime;
    expect(total).toBeCloseTo(entry.estimate);
  });

  it('handles zero rate and overtime by returning multiplier 1', () => {
    const entry = makeEntry({ rate: 0, overtime: 0, estimate: 0 });
    const result = computeDisplayValues(entry);
    expect(result.rate).toBe(0);
    expect(result.overtime).toBe(0);
  });

  it('handles entry with no units', () => {
    const entry = makeEntry({ rate: 100, overtime: 0, estimate: 300, units: [] });
    const result = computeDisplayValues(entry);
    expect(result.rate).toBeCloseTo(300);
    expect(result.overtime).toBe(0);
  });

  it('applies fringes multiplier correctly', () => {
    const entry = makeEntry({
      rate: 100,
      overtime: 0,
      estimate: 220,
      units: [{ label: 'Person', symbol: 'Person (s)', count: 2 }],
    });
    const result = computeDisplayValues(entry);
    expect(result.rate).toBeCloseTo(110);
    expect(result.rate * 2).toBeCloseTo(220);
  });

  it('handles overtime with multiplier', () => {
    const entry = makeEntry({
      rate: 100,
      overtime: 20,
      estimate: 480,
      units: [{ label: 'Day', symbol: 'Days', count: 2 }],
    });
    const result = computeDisplayValues(entry);
    const total = result.rate * 2 + result.overtime;
    expect(total).toBeCloseTo(480);
    expect(result.overtime).toBeGreaterThan(0);
  });

  it('handles negative base by computing correct multiplier', () => {
    const entry = makeEntry({
      rate: -50,
      overtime: 0,
      estimate: -100,
      units: [{ label: 'Day', symbol: 'Days', count: 2 }],
    });
    const result = computeDisplayValues(entry);
    expect(result.rate * 2).toBeCloseTo(-100);
  });

  it('keeps overtime zero if original overtime is zero', () => {
    const entry = makeEntry({
      rate: 100,
      overtime: 0,
      estimate: 400,
      units: [{ label: 'Day', symbol: 'Days', count: 2 }],
    });
    const result = computeDisplayValues(entry);
    expect(result.overtime).toBe(0);
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('converts <br> to newlines', () => {
    expect(stripHtml('Line 1<br>Line 2<br/>Line 3')).toBe('Line 1\nLine 2\nLine 3');
  });

  it('converts </p> and </li> to newlines', () => {
    expect(stripHtml('<p>Paragraph 1</p><p>Paragraph 2</p>')).toBe('Paragraph 1\nParagraph 2');
  });

  it('decodes HTML entities', () => {
    expect(stripHtml('&amp; &lt; &gt; &quot; &#39; &nbsp;')).toBe("& < > \" '");
  });

  it('collapses excessive newlines', () => {
    expect(stripHtml('A\n\n\n\nB')).toBe('A\n\nB');
  });

  it('trims whitespace', () => {
    expect(stripHtml('  <p>Hello</p>  ')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });
});

const makeOffer = (overrides: Record<string, unknown> = {}) => {
  return {
    productionInsurancePercent: '0',
    productionFeePercent: '0',
    postInsurancePercent: '0',
    postMarkupPercent: '0',
    postTaxPercent: '0',
    customFeeNames: {} as Record<string, string>,
    categoryExternalMarkup: {} as Record<string, { enabled: boolean; percent: number; name: string }>,
    ...overrides,
  };
};

describe('buildSectionFees', () => {
  it('returns empty array for non-production non-post tags', () => {
    const fees = buildSectionFees('cat1', ['other'], 10000, makeOffer());
    expect(fees).toEqual([]);
  });

  it('adds production insurance when percent > 0', () => {
    const fees = buildSectionFees('cat1', ['production'], 10000, makeOffer({
      productionInsurancePercent: '5',
    }));
    expect(fees).toHaveLength(1);
    expect(fees[0].label).toBe('Production Insurance');
    expect(fees[0].percent).toBe(5);
    expect(fees[0].value).toBeCloseTo(500);
  });

  it('adds production fee when percent > 0 and no external markup', () => {
    const fees = buildSectionFees('cat1', ['production'], 10000, makeOffer({
      productionFeePercent: '10',
    }));
    expect(fees).toHaveLength(1);
    expect(fees[0].label).toBe('Production Fee');
    expect(fees[0].value).toBeCloseTo(1000);
  });

  it('suppresses production fee when external markup is enabled', () => {
    const fees = buildSectionFees('cat1', ['production'], 10000, makeOffer({
      productionFeePercent: '10',
      categoryExternalMarkup: {
        cat1: { enabled: true, percent: 15, name: 'Agency Markup' },
      },
    }));
    const feeLabels = fees.map(x => x.label);
    expect(feeLabels).not.toContain('Production Fee');
    expect(feeLabels).toContain('Agency Markup');
  });

  it('adds post_production fees correctly', () => {
    const fees = buildSectionFees('cat1', ['post_production'], 10000, makeOffer({
      postInsurancePercent: '3',
      postMarkupPercent: '8',
      postTaxPercent: '2',
    }));
    expect(fees).toHaveLength(3);
    expect(fees[0].label).toBe('Post Insurance');
    expect(fees[0].value).toBeCloseTo(300);
    expect(fees[1].label).toBe('Post Markup');
    expect(fees[1].value).toBeCloseTo(800);
    expect(fees[2].label).toBe('Post Tax');
    expect(fees[2].value).toBeCloseTo(200);
  });

  it('suppresses post markup when external markup is enabled', () => {
    const fees = buildSectionFees('cat1', ['post_production'], 10000, makeOffer({
      postMarkupPercent: '8',
      categoryExternalMarkup: {
        cat1: { enabled: true, percent: 20, name: '' },
      },
    }));
    const feeLabels = fees.map(x => x.label);
    expect(feeLabels).not.toContain('Post Markup');
    expect(feeLabels).toContain('Markup');
  });

  it('uses custom fee names when provided', () => {
    const fees = buildSectionFees('cat1', ['production'], 10000, makeOffer({
      productionInsurancePercent: '5',
      customFeeNames: { PROD_INSURANCE: 'Custom Insurance Name' },
    }));
    expect(fees[0].label).toBe('Custom Insurance Name');
  });

  it('ignores disabled external markup', () => {
    const fees = buildSectionFees('cat1', ['production'], 10000, makeOffer({
      productionFeePercent: '10',
      categoryExternalMarkup: {
        cat1: { enabled: false, percent: 15, name: 'Disabled' },
      },
    }));
    const feeLabels = fees.map(x => x.label);
    expect(feeLabels).toContain('Production Fee');
    expect(feeLabels).not.toContain('Disabled');
  });

  it('ignores external markup with zero percent', () => {
    const fees = buildSectionFees('cat1', ['production'], 10000, makeOffer({
      productionFeePercent: '10',
      categoryExternalMarkup: {
        cat1: { enabled: true, percent: 0, name: 'Zero' },
      },
    }));
    const feeLabels = fees.map(x => x.label);
    expect(feeLabels).toContain('Production Fee');
    expect(feeLabels).not.toContain('Zero');
  });
});
