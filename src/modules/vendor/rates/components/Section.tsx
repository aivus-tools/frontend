'use client';

import ArrowIcon from '@/icons/arrow-icon.svg';
import { CatalogSection, CatalogSubCategory } from '../useRateCardData';
import { UnitOption } from '@/types/entries.interface';
import { EntryRow } from './ItemRow';
import { t } from '@/lib/i18n';
import styles from '../RateTable.module.css';

interface SectionProps {
  section: CatalogSection;
  units: UnitOption[];
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  onPriceChange: (entryId: string, entryName: string, price: number, unitId?: string, unitLabel?: string) => void;
  onUnitChange: (entryId: string, entryName: string, unitId: string, unitLabel: string) => void;
  onRemove: (entryId: string) => void;
}

export function Section({
  section,
  units,
  expandedKeys,
  onToggle,
  onPriceChange,
  onUnitChange,
  onRemove,
}: SectionProps) {
  const sectionKey = section.category.id;
  const isOpen = expandedKeys.has(sectionKey);

  return (
    <div className={styles.sectionCard}>
      {/* Section header */}
      <div className={styles.sectionHeader} onClick={() => onToggle(sectionKey)}>
        <div className={`${styles.arrow} ${isOpen ? styles.arrowOpen : styles.arrowClosed}`}>
          <ArrowIcon />
        </div>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionTitleText}>
            {section.letter}. {section.category.name}
          </span>
        </div>
      </div>

      {/* Section body */}
      {isOpen && (
        <div className={styles.sectionBody}>
          {/* Direct entries (not in any subcategory) */}
          {section.directEntries.map((catalogEntry) => (
            <EntryRow
              key={catalogEntry.entry.id}
              catalogEntry={catalogEntry}
              units={units}
              onPriceChange={onPriceChange}
              onUnitChange={onUnitChange}
              onRemove={onRemove}
            />
          ))}

          {/* Subcategories */}
          {section.subCategories.map((subCat) => (
            <SubSection
              key={subCat.category.id}
              subCategory={subCat}
              parentKey={sectionKey}
              units={units}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
              onPriceChange={onPriceChange}
              onUnitChange={onUnitChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubSectionProps {
  subCategory: CatalogSubCategory;
  parentKey: string;
  units: UnitOption[];
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  onPriceChange: (entryId: string, entryName: string, price: number, unitId?: string, unitLabel?: string) => void;
  onUnitChange: (entryId: string, entryName: string, unitId: string, unitLabel: string) => void;
  onRemove: (entryId: string) => void;
}

function SubSection({
  subCategory,
  parentKey,
  units,
  expandedKeys,
  onToggle,
  onPriceChange,
  onUnitChange,
  onRemove,
}: SubSectionProps) {
  const subKey = `${parentKey}:${subCategory.category.id}`;
  const isOpen = expandedKeys.has(subKey);

  return (
    <div className={styles.subSection}>
      {/* Subsection header */}
      <div className={styles.subSectionHeader} onClick={() => onToggle(subKey)}>
        <div className={`${styles.arrow} ${isOpen ? styles.arrowOpen : styles.arrowClosed}`}>
          <ArrowIcon />
        </div>
        <span className={styles.subSectionTitleText}>{subCategory.category.name}</span>
      </div>

      {/* Entries */}
      {isOpen && (
        <>
          {subCategory.entries.map((catalogEntry) => (
            <EntryRow
              key={catalogEntry.entry.id}
              catalogEntry={catalogEntry}
              units={units}
              onPriceChange={onPriceChange}
              onUnitChange={onUnitChange}
              onRemove={onRemove}
            />
          ))}
        </>
      )}
    </div>
  );
}
