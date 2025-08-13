import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useSearchActiveKey } from './SearchContext';
import { MenuItem } from '../../hooks/useSearchLibrary';
import { OfferData } from '@/types/estimation.interface';
import { menuItemToOfferData } from '../../helpers/menuItemToOfferData';
import { Key } from '@/constants/key';

interface Props {
  onSelect: (item: OfferData) => void;
  isTyping: boolean;
  items: MenuItem[];
}

export const ValueSetter = ({ isTyping, items, children, onSelect }: PropsWithChildren<Props>) => {
  const { activeKey, changeActiveKey } = useSearchActiveKey();

  const handleSelect = useCallback(() => {
    const item = items.find((it) => it.key === activeKey);

    if (item) {
      onSelect(menuItemToOfferData(item));
    }
  }, [activeKey, items, onSelect]);

  const handleEnter = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === Key.ENTER) {
        handleSelect();
      }
      if (e.key === Key.ARROW_DOWN) {
        const index = items.findIndex((it) => it.key === activeKey);
        if (index < items.length - 1) {
          changeActiveKey(items[index + 1].key);
        }
      }
      if (e.key === Key.ARROW_UP) {
        const index = items.findIndex((it) => it.key === activeKey);
        if (index > 0) {
          changeActiveKey(items[index - 1].key);
        }
      }
    },
    [activeKey, changeActiveKey, handleSelect, items]
  );

  useEffect(() => {
    if (isTyping) {
      window.addEventListener('keydown', handleEnter);
      return () => {
        window.removeEventListener('keydown', handleEnter);
      };
    }
  }, [handleEnter, isTyping]);

  return <>{children}</>;
};
