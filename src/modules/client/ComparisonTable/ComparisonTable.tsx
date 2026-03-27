'use client';

import React, { useState } from 'react';
import { Switch } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useGetComparisonQuery } from '@/services/client/comparisonApi';
import { ComparisonCategory, ComparisonVendor, VendorTotal } from '@/types/chat.interface';
import { formatPrice } from '@/helpers/helper';
import Spinner from '@/components/Spinner';
import { ComparisonAnalysis } from './ComparisonAnalysis';
import {
  ComparisonPageWrapper,
  TableArea,
  TableHeader,
  TableTitle,
  ModeToggle,
  ColorLegend,
  LegendItem,
  LegendDot,
  ComparisonTableWrapper,
  StickyHeaderRow,
  HeaderItemCell,
  HeaderVendorCell,
  VendorName,
  VendorTotal as VendorTotalStyled,
  CategoryHeader,
  CategoryName,
  CategoryChevron,
  ItemRow,
  ItemNameCell,
  PriceCell,
  SubtotalRow,
  SubtotalLabel,
  SubtotalValue,
  GrandTotalRow,
  GrandTotalLabel,
  GrandTotalValue,
  EmptyState,
  EmptyTitle,
  EmptyDescription,
} from './styled';

interface ComparisonTableProps {
  briefId: string;
}

function getPriceColor(value: number, min: number, max: number): string {
  if (min === max) return 'rgba(76, 175, 80, 0.15)';
  const ratio = (value - min) / (max - min);
  if (ratio <= 0.25) return 'rgba(76, 175, 80, 0.15)'; // green
  if (ratio <= 0.5) return 'rgba(255, 193, 7, 0.15)'; // yellow
  if (ratio <= 0.75) return 'rgba(255, 152, 0, 0.2)'; // orange
  return 'rgba(244, 67, 54, 0.15)'; // red
}

function getMinMax(values: number[]): { min: number; max: number } {
  const filtered = values.filter((v) => v > 0);
  if (filtered.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...filtered),
    max: Math.max(...filtered),
  };
}

function findVendorTotal(totals: VendorTotal[], vendorId: string): number {
  const found = totals.find((vt) => vt.vendor_id === vendorId);
  return found?.total ?? 0;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ briefId }) => {
  const { data, isLoading, isError } = useGetComparisonQuery(briefId);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [costsOnly, setCostsOnly] = useState(true);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError || !data) {
    return (
      <ComparisonPageWrapper>
        <TableArea>
          <EmptyState>
            <EmptyTitle>{t('COMPARISON')}</EmptyTitle>
            <EmptyDescription>{t('NO_COMPARISON_DATA')}</EmptyDescription>
          </EmptyState>
        </TableArea>
      </ComparisonPageWrapper>
    );
  }

  const { vendors, categories, grand_totals } = data;

  // expandedCategories tracks which categories have been toggled (collapsed)
  const isExpanded = (categoryId: string) => {
    if (expandedCategories.size === 0) return true;
    return !expandedCategories.has(categoryId);
  };

  const renderCategory = (category: ComparisonCategory) => {
    const expanded = isExpanded(category.id);

    return (
      <div key={category.id}>
        <CategoryHeader onClick={() => toggleCategory(category.id)}>
          <CategoryName>{category.name}</CategoryName>
          <CategoryChevron $expanded={expanded}>
            <DownOutlined />
          </CategoryChevron>
        </CategoryHeader>

        {expanded && (
          <>
            {category.items.map((item, itemIndex) => {
              const prices = item.values.map((v) => (costsOnly ? v.cost : v.price));
              const { min, max } = getMinMax(prices);

              return (
                <ItemRow key={`${category.id}-${itemIndex}`}>
                  <ItemNameCell>{item.name}</ItemNameCell>
                  {vendors.map((vendor) => {
                    const valueObj = item.values.find((v) => v.vendor_id === vendor.id);
                    const value = valueObj
                      ? costsOnly
                        ? valueObj.cost
                        : valueObj.price
                      : 0;
                    const bgColor = value > 0 ? getPriceColor(value, min, max) : 'transparent';

                    return (
                      <PriceCell key={vendor.id} $bgColor={bgColor}>
                        {value > 0 ? `$ ${formatPrice(value)}` : '--'}
                      </PriceCell>
                    );
                  })}
                </ItemRow>
              );
            })}

            <SubtotalRow>
              <SubtotalLabel>
                {t('SUBTOTAL')}
              </SubtotalLabel>
              {vendors.map((vendor) => (
                <SubtotalValue key={vendor.id}>
                  $ {formatPrice(findVendorTotal(category.subtotals, vendor.id))}
                </SubtotalValue>
              ))}
            </SubtotalRow>
          </>
        )}
      </div>
    );
  };

  return (
    <ComparisonPageWrapper>
      <TableArea>
        <TableHeader>
          <TableTitle>{t('COMPARISON')}</TableTitle>
          <ModeToggle>
            {t('COMPARISON_MODE')}: {costsOnly ? t('COSTS_ONLY') : t('ALL_ITEMS')}
            <Switch
              checked={costsOnly}
              onChange={(checked) => setCostsOnly(checked)}
              size="small"
            />
          </ModeToggle>
        </TableHeader>

        <ColorLegend>
          <LegendItem>
            <LegendDot $color="#4CAF50" />
            {t('LOWEST')}
          </LegendItem>
          <LegendItem>
            <LegendDot $color="#FFC107" />
            {t('MEDIUM')}
          </LegendItem>
          <LegendItem>
            <LegendDot $color="#FF9800" />
            {t('HIGH')}
          </LegendItem>
          <LegendItem>
            <LegendDot $color="#F44336" />
            {t('HIGHEST')}
          </LegendItem>
        </ColorLegend>

        <ComparisonTableWrapper>
          <StickyHeaderRow>
            <HeaderItemCell>{t('ITEM')}</HeaderItemCell>
            {vendors.map((vendor: ComparisonVendor) => (
              <HeaderVendorCell key={vendor.id}>
                <VendorName>{vendor.name}</VendorName>
                <VendorTotalStyled>
                  $ {formatPrice(vendor.total)}
                </VendorTotalStyled>
              </HeaderVendorCell>
            ))}
          </StickyHeaderRow>

          {categories.map((category: ComparisonCategory) => renderCategory(category))}

          <GrandTotalRow>
            <GrandTotalLabel>{t('GRAND_TOTAL')}</GrandTotalLabel>
            {vendors.map((vendor: ComparisonVendor) => (
              <GrandTotalValue key={vendor.id}>
                $ {formatPrice(findVendorTotal(grand_totals, vendor.id))}
              </GrandTotalValue>
            ))}
          </GrandTotalRow>
        </ComparisonTableWrapper>
      </TableArea>

      <ComparisonAnalysis briefId={briefId} />
    </ComparisonPageWrapper>
  );
};
