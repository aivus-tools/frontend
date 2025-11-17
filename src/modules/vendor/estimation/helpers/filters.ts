import { ComponentProps } from 'react';
import { LibraryDropdown } from '@/modules/vendor/estimation/componnets/LibraryDropdown/LibraryDropdown';

type HandleFilter = Exclude<ComponentProps<typeof LibraryDropdown>['filterOptions'], undefined>;

export const filterOptionsById =
  (id?: string): HandleFilter =>
  (options, searchValue) => {
    if (!searchValue && id) {
      return options.filter((option) => option.categoryId === id);
    }
    return options;
  };

export const filterOptionsBySetOfId =
  (setIds?: Set<string>): HandleFilter =>
  (options, searchValue) => {
    if (!searchValue && setIds) {
      return options.filter((option) => setIds.has(option.categoryId));
    }
    return options;
  };
