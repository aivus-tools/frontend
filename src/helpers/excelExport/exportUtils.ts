import { ExportEntryItem } from '@/types/exportData.interface';

export interface DisplayValues {
  rate: number;
  overtime: number;
}

export const computeDisplayValues = (entry: ExportEntryItem): DisplayValues => {
  const unitsProduct = entry.units.reduce((acc, x) => acc * (x != null ? x.count : 1), 1);
  const base = (entry.rate + entry.overtime) * unitsProduct;
  const multiplier = base !== 0 ? entry.estimate / base : 1;
  return {
    rate: entry.rate * multiplier,
    overtime: entry.overtime > 0 ? entry.overtime * multiplier * unitsProduct : 0,
  };
};

export const stripHtml = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

interface FeeItem {
  label: string;
  percent: number;
  value: number;
}

const DEFAULT_FEE_NAMES: Record<string, string> = {
  PROD_INSURANCE: 'Production Insurance',
  PROD_FEE: 'Production Fee',
  POST_INSURANCE: 'Post Insurance',
  POST_MARKUP: 'Post Markup',
  POST_TAX: 'Post Tax',
};

const getFeeName = (key: string, customFeeNames: Record<string, string>): string => {
  return customFeeNames[key] || DEFAULT_FEE_NAMES[key] || key;
};

interface OfferFeeData {
  productionInsurancePercent: string;
  productionFeePercent: string;
  postInsurancePercent: string;
  postMarkupPercent: string;
  postTaxPercent: string;
  customFeeNames: Record<string, string>;
  categoryExternalMarkup: Record<string, { enabled: boolean; percent: number; name: string }>;
}

export const buildSectionFees = (
  categoryId: string,
  tags: string[],
  subtotal: number,
  offer: OfferFeeData,
): FeeItem[] => {
  const fees: FeeItem[] = [];
  const customNames = offer.customFeeNames || {};

  const extMarkup = (offer.categoryExternalMarkup || {})[categoryId];
  const hasExternalMarkup = !!extMarkup?.enabled && extMarkup.percent > 0;

  if (tags.includes('production')) {
    const insurancePct = parseFloat(offer.productionInsurancePercent) || 0;
    const feePct = parseFloat(offer.productionFeePercent) || 0;
    if (insurancePct > 0) {
      fees.push({ label: getFeeName('PROD_INSURANCE', customNames), percent: insurancePct, value: subtotal * (insurancePct / 100) });
    }
    if (feePct > 0 && !hasExternalMarkup) {
      fees.push({ label: getFeeName('PROD_FEE', customNames), percent: feePct, value: subtotal * (feePct / 100) });
    }
  }
  if (tags.includes('post_production')) {
    const insurancePct = parseFloat(offer.postInsurancePercent) || 0;
    const markupPct = parseFloat(offer.postMarkupPercent) || 0;
    const taxPct = parseFloat(offer.postTaxPercent) || 0;
    if (insurancePct > 0) {
      fees.push({ label: getFeeName('POST_INSURANCE', customNames), percent: insurancePct, value: subtotal * (insurancePct / 100) });
    }
    if (markupPct > 0 && !hasExternalMarkup) {
      fees.push({ label: getFeeName('POST_MARKUP', customNames), percent: markupPct, value: subtotal * (markupPct / 100) });
    }
    if (taxPct > 0) {
      fees.push({ label: getFeeName('POST_TAX', customNames), percent: taxPct, value: subtotal * (taxPct / 100) });
    }
  }

  if (hasExternalMarkup) {
    fees.push({
      label: extMarkup!.name || 'Markup',
      percent: extMarkup!.percent,
      value: subtotal * (extMarkup!.percent / 100),
    });
  }

  return fees;
};
