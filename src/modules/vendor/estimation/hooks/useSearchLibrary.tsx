import React, { useMemo, ReactNode } from 'react';
import { Label } from '@/modules/vendor/estimation/componnets/LibraryDropdown/Label';
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

  const { categories, entries } = useMemo(() => {
    let categories: Category[] = [];
    let entries: Entry[] = [];

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
    }

    return { categories, entries };
  }, [categoriesQuery.data, categoriesQuery.isSuccess, entriesQuery.data?.entries, entriesQuery.isSuccess, skip]);

  return useMemo(
    () =>
      entries?.reduce((acc: MenuItem[], entry) => {
        const category = categories?.find((cat) => cat.id === entry.categoryId);
        if (!category) return acc;

        acc.push({
          ...entry,
          key: `${category.id}${KEY_SEPARATOR}${entry.id}`,
          label: <Label itemKey={`${category.id}${KEY_SEPARATOR}${entry.id}`}>{`${entry.name}`}</Label>,
          value: `${entry.name}`,
          name: entry.name,
        });

        return acc;
      }, []),

    [categories, entries]
  );
};
