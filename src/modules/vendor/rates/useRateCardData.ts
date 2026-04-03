'use client';

import { useMemo } from 'react';
import { useGetRateCardsQuery, useUpdateRateCardMutation, useCreateRateCardMutation } from '@/services/client/ratesApi';
import { categoriesApi } from '@/services/client/categoriesApi';
import { RateCard, RateCardItem, RateCardItemPayload } from '@/types/rate.interface';
import { Category } from '@/types/categories.interface';
import { Entry, UnitOption } from '@/types/entries.interface';

export interface CatalogEntry {
  entry: Entry;
  rateItem?: RateCardItem;
  label: string;
}

export interface CatalogSubCategory {
  category: Category;
  entries: CatalogEntry[];
}

export interface CatalogSection {
  category: Category;
  subCategories: CatalogSubCategory[];
  directEntries: CatalogEntry[];
  letter: string;
}

export function useRateCardData() {
  const { data: rateCards = [], isLoading: isLoadingRates } = useGetRateCardsQuery();
  const { data: categories = [], isLoading: isLoadingCategories } = categoriesApi.useGetCategoriesQuery();
  const { data: entriesData, isLoading: isLoadingEntries } = categoriesApi.useGetEntriesFullQuery();
  const { data: unitsData } = categoriesApi.useGetUnitsQuery();
  const [updateRateCard] = useUpdateRateCardMutation();
  const [createRateCard] = useCreateRateCardMutation();

  const rateCard: RateCard | undefined = rateCards[0];
  const entries: Entry[] = useMemo(() => entriesData?.entries || [], [entriesData]);
  const units: UnitOption[] = useMemo(() => unitsData?.units || [], [unitsData]);

  // Map entryId → RateCardItem for quick lookup
  const rateItemsByEntryId = useMemo(() => {
    const map = new Map<string, RateCardItem>();
    rateCard?.items?.forEach((item) => {
      if (item.entryId) {
        map.set(item.entryId, item);
      }
    });
    return map;
  }, [rateCard]);

  const catalogSections = useMemo((): CatalogSection[] => {
    if (!categories.length) return [];

    const toSectionLetter = (index: number): string => {
      let result = '';
      let n = index;
      do {
        result = String.fromCharCode(65 + (n % 26)) + result;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      return result;
    };

    const rootCategories = categories.filter((c) => !c.parentCategoryId).sort((a, b) => a.name.localeCompare(b.name));

    return rootCategories.map((rootCat, sectionIndex) => {
      const letter = toSectionLetter(sectionIndex);
      let entryCounter = 0;

      const subCategories = categories
        .filter((c) => c.parentCategoryId === rootCat.id)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(
          (subCat): CatalogSubCategory => ({
            category: subCat,
            entries: entries
              .filter((e) => e.categoryId === subCat.id)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(
                (entry): CatalogEntry => ({
                  entry,
                  rateItem: rateItemsByEntryId.get(entry.id),
                  label: `${letter}${++entryCounter}`,
                })
              ),
          })
        );

      const directEntries = entries
        .filter((e) => e.categoryId === rootCat.id)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(
          (entry): CatalogEntry => ({
            entry,
            rateItem: rateItemsByEntryId.get(entry.id),
            label: `${letter}${++entryCounter}`,
          })
        );

      return { category: rootCat, subCategories, directEntries, letter };
    });
  }, [categories, entries, rateItemsByEntryId]);

  // Save all items (replaces entire rate card items array)
  const saveItems = async (newItems: RateCardItemPayload[]) => {
    if (rateCard) {
      await updateRateCard({ id: rateCard.id, items: newItems });
    } else {
      await createRateCard({ name: 'Default Rate Card', items: newItems });
    }
  };

  // Build current items array from rate card
  const getCurrentItems = (): RateCardItemPayload[] =>
    (rateCard?.items || []).map((item) => ({
      entryId: item.entryId,
      itemName: item.itemName,
      price: item.price,
      unitId: item.unitId,
      unitLabel: item.unitLabel,
    }));

  // Set price for an entry (creates or updates rate card item)
  const setEntryPrice = async (
    entryId: string,
    entryName: string,
    price: number,
    unitId?: string,
    unitLabel?: string
  ) => {
    const currentItems = getCurrentItems();
    const existingIndex = currentItems.findIndex((item) => item.entryId === entryId);

    if (existingIndex >= 0) {
      currentItems[existingIndex].price = price;
    } else {
      currentItems.push({ entryId, itemName: entryName, price, unitId, unitLabel });
    }

    await saveItems(currentItems);
  };

  // Set unit for an entry
  const setEntryUnit = async (entryId: string, entryName: string, unitId: string, unitLabel: string) => {
    const currentItems = getCurrentItems();
    const existingIndex = currentItems.findIndex((item) => item.entryId === entryId);

    if (existingIndex >= 0) {
      currentItems[existingIndex].unitId = unitId;
      currentItems[existingIndex].unitLabel = unitLabel;
    } else {
      currentItems.push({ entryId, itemName: entryName, price: 0, unitId, unitLabel });
    }

    await saveItems(currentItems);
  };

  // Remove entry from rate card
  const removeEntry = async (entryId: string) => {
    const currentItems = getCurrentItems().filter((item) => item.entryId !== entryId);
    await saveItems(currentItems);
  };

  const isLoading = isLoadingRates || isLoadingCategories || isLoadingEntries;

  return {
    rateCard,
    catalogSections,
    isLoading,
    categories,
    entries,
    units,
    setEntryPrice,
    setEntryUnit,
    removeEntry,
  };
}
