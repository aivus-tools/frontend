'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Spinner from '@/components/Spinner';
import { RateHeader } from './components/Header';
import { Section } from './components/Section';
import { useRateCardData, CatalogSection } from './useRateCardData';
import { t } from '@/lib/i18n';

import styles from './RateTable.module.css';

export function RateTable() {
  const { catalogSections, isLoading, units, setEntryPrice, setEntryUnit, removeEntry } = useRateCardData();

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredSections = useMemo((): CatalogSection[] => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return catalogSections;
    }

    return catalogSections
      .map((section) => {
        const filteredSubCategories = section.subCategories
          .map((sub) => ({
            ...sub,
            entries: sub.entries.filter(
              (x) => x.entry.name.toLowerCase().includes(query) || x.label.toLowerCase().includes(query)
            ),
          }))
          .filter((sub) => sub.entries.length > 0);

        const filteredDirectEntries = section.directEntries.filter(
          (x) => x.entry.name.toLowerCase().includes(query) || x.label.toLowerCase().includes(query)
        );

        if (filteredSubCategories.length === 0 && filteredDirectEntries.length === 0) {
          return null;
        }

        return {
          ...section,
          subCategories: filteredSubCategories,
          directEntries: filteredDirectEntries,
        };
      })
      .filter((x): x is CatalogSection => x !== null);
  }, [catalogSections, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const allKeys = new Set<string>();
      filteredSections.forEach((section) => {
        allKeys.add(section.category.id);
        section.subCategories.forEach((sub) => {
          allKeys.add(`${section.category.id}:${sub.category.id}`);
        });
      });
      setExpandedKeys(allKeys);
    }
  }, [filteredSections, searchQuery]);

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
      <div style={{ marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#99A1B7' }} />}
          placeholder={t('RATES_SEARCH_PLACEHOLDER')}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          allowClear
          size='middle'
          style={{ maxWidth: 320 }}
        />
      </div>
      <RateHeader />
      {filteredSections.map((section) => (
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
      {filteredSections.length === 0 && searchQuery.trim() && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#99A1B7', fontSize: 14 }}>
          {t('RATES_NO_RESULTS', searchQuery)}
        </div>
      )}
    </div>
  );
}
