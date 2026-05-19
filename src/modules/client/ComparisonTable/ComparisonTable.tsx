'use client';

import React, { useState } from 'react';
import { Drawer, FloatButton, Switch } from 'antd';
import { DownOutlined, MessageOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useGetComparisonQuery } from '@/services/client/comparisonApi';
import { ComparisonCategory, ComparisonVendor, VendorTotal } from '@/types/chat.interface';
import { formatPrice } from '@/helpers/helper';
import { PageSpinner } from '@/components/PageSpinner';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ComparisonAnalysis } from './ComparisonAnalysis';

import styles from './ComparisonTable.module.css';

interface ComparisonTableProps {
  briefId: string;
}

function getPriceColor(value: number, min: number, max: number): string {
  if (min === max) {
    return 'rgba(76, 175, 80, 0.15)';
  }
  const ratio = (value - min) / (max - min);
  if (ratio <= 0.25) {
    return 'rgba(76, 175, 80, 0.15)';
  }
  if (ratio <= 0.5) {
    return 'rgba(255, 193, 7, 0.15)';
  }
  if (ratio <= 0.75) {
    return 'rgba(255, 152, 0, 0.2)';
  }
  return 'rgba(244, 67, 54, 0.15)';
}

function getMinMax(values: number[]): { min: number; max: number } {
  const filtered = values.filter((x) => x > 0);
  if (filtered.length === 0) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...filtered),
    max: Math.max(...filtered),
  };
}

function findVendorTotal(totals: VendorTotal[], vendorId: string): number {
  const found = totals.find((x) => x.vendor_id === vendorId);
  return found?.total ?? 0;
}

export const ComparisonTable = (props: ComparisonTableProps) => {
  const { briefId } = props;
  const { data, isLoading, isError } = useGetComparisonQuery(briefId);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [costsOnly, setCostsOnly] = useState(true);
  const { isMobile } = useBreakpoint();
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.tableArea}>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>{t('COMPARISON')}</div>
            <div className={styles.emptyDescription}>{t('NO_COMPARISON_DATA')}</div>
          </div>
        </div>
      </div>
    );
  }

  const { vendors, categories, grand_totals } = data;

  const isExpanded = (categoryId: string) => {
    if (expandedCategories.size === 0) {
      return true;
    }
    return !expandedCategories.has(categoryId);
  };

  const renderCategory = (category: ComparisonCategory) => {
    const expanded = isExpanded(category.id);

    return (
      <div key={category.id}>
        <div className={styles.categoryHeader} onClick={() => toggleCategory(category.id)}>
          <span className={styles.categoryName}>{category.name}</span>
          <span
            className={
              expanded ? `${styles.categoryChevron} ${styles.categoryChevronExpanded}` : styles.categoryChevron
            }
          >
            <DownOutlined />
          </span>
        </div>

        {expanded && (
          <>
            {category.items.map((item, itemIndex) => {
              const prices = item.values.map((x) => (costsOnly ? x.cost : x.price));
              const { min, max } = getMinMax(prices);

              return (
                <div key={`${category.id}-${itemIndex}`} className={styles.itemRow}>
                  <div className={styles.itemNameCell}>{item.name}</div>
                  {vendors.map((vendor) => {
                    const valueObj = item.values.find((x) => x.vendor_id === vendor.id);
                    const value = valueObj ? (costsOnly ? valueObj.cost : valueObj.price) : 0;
                    const bgColor = value > 0 ? getPriceColor(value, min, max) : 'transparent';

                    return (
                      <div
                        key={vendor.id}
                        className={styles.priceCell}
                        style={{ '--cell-bg': bgColor } as React.CSSProperties}
                      >
                        {value > 0 ? `$ ${formatPrice(value)}` : '--'}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <div className={styles.subtotalRow}>
              <div className={styles.subtotalLabel}>{t('SUBTOTAL')}</div>
              {vendors.map((vendor) => (
                <div key={vendor.id} className={styles.subtotalValue}>
                  $ {formatPrice(findVendorTotal(category.subtotals, vendor.id))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.tableArea}>
        <div className={styles.tableHeader}>
          <h1 className={styles.tableTitle}>{t('COMPARISON')}</h1>
          <div className={styles.modeToggle}>
            {t('COMPARISON_MODE')}: {costsOnly ? t('COSTS_ONLY') : t('ALL_ITEMS')}
            <Switch checked={costsOnly} onChange={(checked) => setCostsOnly(checked)} size='small' />
          </div>
        </div>

        <div className={styles.colorLegend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ '--legend-dot-color': 'var(--compare-green)' } as React.CSSProperties}
            />
            {t('LOWEST')}
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ '--legend-dot-color': 'var(--compare-yellow)' } as React.CSSProperties}
            />
            {t('MEDIUM')}
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ '--legend-dot-color': 'var(--compare-orange)' } as React.CSSProperties}
            />
            {t('HIGH')}
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ '--legend-dot-color': 'var(--compare-red)' } as React.CSSProperties}
            />
            {t('HIGHEST')}
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.stickyHeaderRow}>
            <div className={styles.headerItemCell}>{t('ITEM')}</div>
            {vendors.map((vendor: ComparisonVendor) => (
              <div key={vendor.id} className={styles.headerVendorCell}>
                <div className={styles.vendorName}>{vendor.name}</div>
                <div className={styles.vendorTotal}>$ {formatPrice(vendor.total)}</div>
              </div>
            ))}
          </div>

          {categories.map((category: ComparisonCategory) => renderCategory(category))}

          <div className={styles.grandTotalRow}>
            <div className={styles.grandTotalLabel}>{t('GRAND_TOTAL')}</div>
            {vendors.map((vendor: ComparisonVendor) => (
              <div key={vendor.id} className={styles.grandTotalValue}>
                $ {formatPrice(findVendorTotal(grand_totals, vendor.id))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isMobile && <ComparisonAnalysis briefId={briefId} />}
      {isMobile && (
        <>
          <FloatButton
            icon={<MessageOutlined />}
            type='primary'
            tooltip={t('COMPARISON_OPEN_AI_ANALYSIS')}
            onClick={() => setAnalysisOpen(true)}
            className={styles.floatButton}
          />
          <Drawer
            placement='bottom'
            open={analysisOpen}
            onClose={() => setAnalysisOpen(false)}
            height='min(80vh, 80dvh)'
            styles={{ body: { padding: 0 } }}
            title={t('COMPARISON_OPEN_AI_ANALYSIS')}
            destroyOnClose={false}
          >
            <ComparisonAnalysis briefId={briefId} />
          </Drawer>
        </>
      )}
    </div>
  );
};
