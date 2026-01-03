'use client';

import { Dropdown } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { OfferData } from '@/types/estimation.interface';
import { useRowHover } from '../../context/hover';
import { MenuItem, useSearchLibrary } from '../../hooks/useSearchLibrary';
import debounce from 'lodash.debounce';
import { SearchProvider } from './SearchContext';
import { ValueSetter } from './ValueSetter';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { menuItemToOfferData } from '../../helpers/menuItemToOfferData';

import styles from './LibraryDropdown.module.css';

interface ComponentParams {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleFocus: () => void;
  value: string;
}

interface Props {
  value?: OfferData;
  componentAction: (props: ComponentParams) => React.ReactNode;
  onSelect?: (value: OfferData) => void;
  filterOptions?: (options: MenuItem[], searchValue: string) => MenuItem[];
}

export const LibraryDropdown = ({ value, componentAction, onSelect, filterOptions }: Props) => {
  const { focusRow } = useRowHover();
  const [isTyping, setIsTyping] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { items: library, globalDefaultUnit } = useSearchLibrary();
  const items = useMemo(() => {
    if (!library) return [];
    const result = library.filter((it) => it.value.toLowerCase().includes(searchValue.toLowerCase()));
    if (filterOptions) {
      return filterOptions(result, searchValue);
    }
    return result;
  }, [library, searchValue, filterOptions]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedIsTyping = useCallback(debounce(setIsTyping, 150), []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedIsTyping(true);
      setSearchValue(e.currentTarget.value);
    },
    [debouncedIsTyping]
  );

  const handleBlur = useCallback(() => {
    focusRow(null);
    setTimeout(() => {
      setIsTyping(false);
    }, 0);
  }, [focusRow]);

  const handleFocus = useCallback(() => {
    focusRow(value?.id ?? null);
  }, [focusRow, value]);

  const handleSelect = useCallback(
    (item: OfferData) => {
      onSelect?.(item);
      setIsTyping(false);
      setSearchValue('');
    },
    [onSelect]
  );

  const handleClick: MenuClickEventHandler = useCallback(
    ({ key }) => {
      const selectedItem = items.find((item) => item.key === key);
      if (selectedItem) {
        handleSelect(menuItemToOfferData(selectedItem, globalDefaultUnit));
      }
    },
    [items, handleSelect, globalDefaultUnit]
  );

  const itemsForDropdown = items.map((item) => ({
    key: item.key,
    label: item.label,
    title: item.value,
  }));

  return (
    <SearchProvider activeKey={items[0]?.key}>
      <ValueSetter isTyping={isTyping} onSelect={handleSelect} items={items} globalDefaultUnit={globalDefaultUnit}>
        <Dropdown
          menu={{ items: itemsForDropdown, onClick: handleClick }}
          onOpenChange={(open) => {
            setIsTyping(open);
          }}
          trigger={['click']}
          overlayClassName={styles.overlay}
        >
          <div>
            {componentAction({
              handleChange,
              handleBlur,
              handleFocus,
              value: !isTyping && value ? value.item : searchValue,
            })}
          </div>
        </Dropdown>
      </ValueSetter>
    </SearchProvider>
  );
};
