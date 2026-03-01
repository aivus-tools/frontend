'use client';

import { InputNumber, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { CatalogEntry } from '../useRateCardData';
import { UnitOption } from '@/types/entries.interface';
import { t } from '@/lib/i18n';
import styles from '../RateTable.module.css';

interface EntryRowProps {
  catalogEntry: CatalogEntry;
  units: UnitOption[];
  onPriceChange: (entryId: string, entryName: string, price: number, unitId?: string, unitLabel?: string) => void;
  onUnitChange: (entryId: string, entryName: string, unitId: string, unitLabel: string) => void;
  onRemove: (entryId: string) => void;
}

export function EntryRow({ catalogEntry, units, onPriceChange, onUnitChange, onRemove }: EntryRowProps) {
  const { entry, rateItem } = catalogEntry;
  const price = rateItem ? Number(rateItem.price) : 0;
  const hasRate = !!rateItem;

  // Get available unit options for this entry
  const unitOptions = getUnitOptions(entry, units);

  // Current unit: from rate card item, or entry default
  const currentUnitId = rateItem?.unitId || getDefaultUnitId(entry);
  const currentUnitLabel = rateItem?.unitLabel || getDefaultUnitLabel(entry);

  const handlePriceChange = (val: number | null) => {
    if (val === null) return;
    onPriceChange(entry.id, entry.name, val, currentUnitId || undefined, currentUnitLabel || undefined);
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onPriceChange(entry.id, entry.name, val, currentUnitId || undefined, currentUnitLabel || undefined);
    }
  };

  const handleUnitChange = (unitId: string) => {
    const opt = unitOptions.find((u) => u.id === unitId);
    onUnitChange(entry.id, entry.name, unitId, opt?.name || '');
  };

  const handleRemove = () => {
    onRemove(entry.id);
  };

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemName}>
        <span className={styles.itemNameText}>{entry.name}</span>
      </div>
      <div className={styles.priceCell}>
        <InputNumber
          className={styles.priceInput}
          value={price}
          onChange={handlePriceChange}
          controls={false}
          min={0}
          precision={1}
          variant="borderless"
          onBlur={handlePriceBlur}
        />
      </div>
      {/* <div className={styles.perCell}>{t('PER')}</div>
      <div className={styles.unitCell}>
        <Select
          className={styles.unitSelect}
          value={currentUnitId || undefined}
          onChange={handleUnitChange}
          variant="borderless"
          placeholder={t('SELECT_UNIT')}
          options={unitOptions.map((u) => ({ value: u.id, label: u.name }))}
          popupMatchSelectWidth={false}
        />
      </div> */}
      <div className={styles.actionsCell}>
        {hasRate && (
          <button className={styles.deleteBtn} onClick={handleRemove} aria-label={t('DELETE')}>
            <CloseOutlined style={{ fontSize: 10 }} />
          </button>
        )}
      </div>
    </div>
  );
}

function getUnitOptions(entry: CatalogEntry['entry'], allUnits: UnitOption[]): UnitOption[] {
  if (entry.units) {
    const entryUnits = [
      ...(entry.units.quantity || []),
      ...(entry.units.temporal || []),
    ];
    if (entryUnits.length > 0) return entryUnits;
  }
  return allUnits;
}

function getDefaultUnitId(entry: CatalogEntry['entry']): string | null {
  if (!entry.units) return null;
  const allUnits = [...(entry.units.quantity || []), ...(entry.units.temporal || [])];
  const defaultUnit = allUnits.find((u) => u.isDefault);
  return defaultUnit?.id || allUnits[0]?.id || null;
}

function getDefaultUnitLabel(entry: CatalogEntry['entry']): string | null {
  if (entry.units) {
    const entryUnits = [...(entry.units.quantity || []), ...(entry.units.temporal || [])];
    const defaultUnit = entryUnits.find((u) => u.isDefault);
    if (defaultUnit) return defaultUnit.name;
    if (entryUnits[0]) return entryUnits[0].name;
  }
  return null;
}
