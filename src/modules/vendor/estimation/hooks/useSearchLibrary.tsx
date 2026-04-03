import React, { useMemo, ReactNode } from 'react';
import { Label } from '@/modules/vendor/estimation/components/LibraryDropdown/Label';
import { categoriesApi } from '@/services/client/categoriesApi';
import { Entry } from '@/types/entries.interface';
import { useAppSelector } from '@/store/hooks';
import { selectIsExternal } from '@/store/slices/offer/selectors';
import { CATEGORIES } from '../mock/categories';
import { Category } from '@/types/categories.interface';
import { ENTRIES } from '../mock/entries';
import { KEY_SEPARATOR } from '../constants';

export interface MenuItem extends Entry {
  key: string;
  label: string | ReactNode;
  value: string;
  active?: boolean;
  path?: string;
  name: string;
}

export const useSearchLibrary = () => {
  const skip = useAppSelector(selectIsExternal);
  const categoriesQuery = categoriesApi.useGetCategoriesQuery(undefined, {
    skip,
  });
  const entriesQuery = categoriesApi.useGetEntriesFullQuery(undefined, {
    skip,
  });
  const unitsQuery = categoriesApi.useGetUnitsQuery(undefined, {
    skip,
  });

  const { categories, entries, globalDefaultUnit } = useMemo(() => {
    let categories: Category[] = [];
    let entries: Entry[] = [];
    let globalDefaultUnit = undefined;

    if (skip) {
      categories = CATEGORIES;
      entries = ENTRIES;
    } else {
      if (categoriesQuery.isSuccess) {
        categories = categoriesQuery.data;
      }
      if (entriesQuery.isSuccess) {
        entries = entriesQuery.data?.entries || [];
      }
      if (unitsQuery.isSuccess) {
        globalDefaultUnit = unitsQuery.data?.units?.find((u) => u.isDefault);
      }
    }

    return { categories, entries, globalDefaultUnit };
  }, [
    categoriesQuery.data,
    categoriesQuery.isSuccess,
    entriesQuery.data?.entries,
    entriesQuery.isSuccess,
    unitsQuery.data?.units,
    unitsQuery.isSuccess,
    skip,
  ]);

  const items = useMemo(
    () =>
      entries?.reduce((acc: MenuItem[], entry) => {
        const category = categories?.find((cat) => cat.id === entry.categoryId);
        if (!category) return acc;

        const parentCategory = category.parentCategoryId
          ? categories?.find((cat) => cat.id === category.parentCategoryId)
          : null;
        const sectionPath = parentCategory ? `${parentCategory.name} / ${category.name}` : category.name;
        const itemKey = `${category.id}${KEY_SEPARATOR}${entry.id}`;

        acc.push({
          ...entry,
          key: itemKey,
          label: (
            <Label itemKey={itemKey}>
              {entry.name}
              <span style={{ color: '#99A1B7', fontSize: 12, marginLeft: 8 }}>{sectionPath}</span>
            </Label>
          ),
          value: `${entry.name}`,
          name: entry.name,
          path: sectionPath,
        });

        return acc;
      }, []),

    [categories, entries]
  );

  return { items, globalDefaultUnit };
};
