'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '@/components/Spinner';
import { RateHeader } from './components/Header';
import { Section } from './components/Section';
import { useRateCardData } from './useRateCardData';

import styles from './RateTable.module.css';

export function RateTable() {
  const {
    catalogSections,
    isLoading,
    units,
    setEntryPrice,
    setEntryUnit,
    removeEntry,
  } = useRateCardData();

  // Expand/collapse state: set of expanded keys (section ids, subcategory ids)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const toggleKey = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Initialize all sections as expanded when data first arrives
  useEffect(() => {
    if (!initializedRef.current && catalogSections.length > 0) {
      const allKeys = new Set<string>();
      catalogSections.forEach((section) => {
        allKeys.add(section.category.id);
        section.subCategories.forEach((sub) => {
          allKeys.add(`${section.category.id}:${sub.category.id}`);
        });
      });
      setExpandedKeys(allKeys);
      initializedRef.current = true;
    }
  }, [catalogSections]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className={styles.rateTable}>
      <RateHeader />
      {catalogSections.map((section) => (
        <Section
          key={section.category.id}
          section={section}
          units={units}
          expandedKeys={expandedKeys}
          onToggle={toggleKey}
          onPriceChange={setEntryPrice}
          onUnitChange={setEntryUnit}
          onRemove={removeEntry}
        />
      ))}
    </div>
  );
}
