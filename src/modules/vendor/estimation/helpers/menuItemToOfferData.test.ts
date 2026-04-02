import { describe, it, expect, vi } from 'vitest';
import { menuItemToOfferData } from './menuItemToOfferData';
import { UnitType } from '@/types/estimation.interface';
import { UnitOption } from '@/types/entries.interface';

vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-123' });

const createMenuItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'entry-1',
  name: 'Camera Operator',
  key: 'cat-1:entry-1',
  label: 'Camera Operator',
  value: 'entry-1',
  categoryId: 'cat-1',
  ...overrides,
});

const dayUnit: UnitOption = { id: 'u1', name: 'Day', symbol: 'day', dimension: 'TEMPORAL', isDefault: true };
const hourUnit: UnitOption = { id: 'u2', name: 'Hour', symbol: 'hr', dimension: 'TEMPORAL', isDefault: false };
const eachUnit: UnitOption = { id: 'u3', name: 'Each', symbol: 'ea', dimension: 'QUANTITY', isDefault: false };
const flatUnit: UnitOption = { id: 'u4', name: 'Flat', symbol: 'flat', dimension: 'QUANTITY', isDefault: true };

describe('menuItemToOfferData', () => {
  it('creates offer data with correct base fields', () => {
    const item = createMenuItem();
    const result = menuItemToOfferData(item as never);
    expect(result.id).toBe('test-uuid-123');
    expect(result.entryId).toBe('entry-1');
    expect(result.categoryId).toBe('cat-1');
    expect(result.item).toBe('Camera Operator');
    expect(result.price).toBe(0);
    expect(result.cost).toBe(0);
    expect(result.surcharge).toBe(0);
    expect(result.isLinkedSurcharge).toBe(true);
  });

  it('splits key by separator to get categoryId and entryId', () => {
    const item = createMenuItem({ key: 'parent-cat:child-entry' });
    const result = menuItemToOfferData(item as never);
    expect(result.categoryId).toBe('parent-cat');
    expect(result.entryId).toBe('child-entry');
  });

  it('maps temporal units to TIME options', () => {
    const item = createMenuItem({ units: { temporal: [dayUnit, hourUnit], quantity: [] } });
    const result = menuItemToOfferData(item as never);
    expect(result.options[UnitType.TIME]).toHaveLength(2);
    expect(result.options[UnitType.TIME][0].value).toBe('u1');
    expect(result.options[UnitType.TIME][0].label).toBe('Day (s)');
    expect(result.options[UnitType.TIME][0].type).toBe(UnitType.TIME);
  });

  it('maps quantity units to QUANTITY options', () => {
    const item = createMenuItem({ units: { temporal: [], quantity: [eachUnit, flatUnit] } });
    const result = menuItemToOfferData(item as never);
    expect(result.options[UnitType.QUANTITY]).toHaveLength(2);
    expect(result.options[UnitType.QUANTITY][0].label).toBe('Each');
    expect(result.options[UnitType.QUANTITY][1].label).toBe('Flat');
  });

  it('uses Flat/Each name without (s) suffix', () => {
    const item = createMenuItem({ units: { temporal: [], quantity: [flatUnit, eachUnit] } });
    const result = menuItemToOfferData(item as never);
    expect(result.options[UnitType.QUANTITY][0].label).toBe('Flat');
    expect(result.options[UnitType.QUANTITY][1].label).toBe('Each');
  });

  it('selects default temporal unit as first unit', () => {
    const item = createMenuItem({ units: { temporal: [hourUnit, dayUnit], quantity: [] } });
    const result = menuItemToOfferData(item as never);
    expect(result.units).toHaveLength(1);
    expect(result.units[0]!.value).toBe('u1');
  });

  it('falls back to first temporal unit when no default', () => {
    const noDefault = { ...hourUnit, isDefault: false };
    const item = createMenuItem({ units: { temporal: [noDefault], quantity: [] } });
    const result = menuItemToOfferData(item as never);
    expect(result.units).toHaveLength(1);
    expect(result.units[0]!.value).toBe('u2');
  });

  it('uses globalDefaultUnit when no units available', () => {
    const item = createMenuItem({ units: { temporal: [], quantity: [] } });
    const result = menuItemToOfferData(item as never, dayUnit);
    expect(result.units).toHaveLength(1);
    expect(result.units[0]!.value).toBe('u1');
    expect(result.options[UnitType.TIME]).toHaveLength(1);
  });

  it('handles missing units gracefully', () => {
    const item = createMenuItem();
    const result = menuItemToOfferData(item as never);
    expect(result.options[UnitType.TIME]).toEqual([]);
    expect(result.options[UnitType.QUANTITY]).toEqual([]);
    expect(result.units).toEqual([]);
  });

  it('uses QUANTITY type for non-temporal globalDefaultUnit', () => {
    const item = createMenuItem({ units: { temporal: [], quantity: [] } });
    const result = menuItemToOfferData(item as never, eachUnit);
    expect(result.units).toHaveLength(1);
    expect(result.options[UnitType.QUANTITY]).toHaveLength(1);
    expect(result.options[UnitType.TIME]).toHaveLength(0);
  });
});
