import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { useSearchActiveKey } from '../LibraryDropdown/SearchContext';
import { useHandleSelect } from '@/modules/vendor/estimation/context/select';

import styles from './Label.module.css';

interface LabelProps {
  itemKey?: string;
}

export const Label = (props: PropsWithChildren<LabelProps>) => {
  const { activeKey, changeActiveKey } = useSearchActiveKey();
  const handleSelect = useHandleSelect();

  const isActive = activeKey === props.itemKey;
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (props.itemKey) {
      changeActiveKey(props.itemKey);
    }
  }, [changeActiveKey, props.itemKey]);

  useEffect(() => {
    const parentLi = ref.current?.closest('li');
    if (parentLi) {
      if (isActive) {
        parentLi.style.background = 'rgba(0, 0, 0, 0.04)';
      } else {
        parentLi.style.background = 'none';
      }
      parentLi.addEventListener('mouseenter', handleMouseEnter);
      parentLi.addEventListener('click', handleSelect);
      return () => {
        parentLi.removeEventListener('mouseenter', handleMouseEnter);
        parentLi.removeEventListener('click', handleSelect);
      };
    }
  }, [changeActiveKey, handleMouseEnter, handleSelect, isActive, props.itemKey]);

  const iconClass = isActive ? `${styles.icon} ${styles.iconActive}` : styles.icon;

  return (
    <div className={styles.wrapper} ref={ref} onClick={handleSelect}>
      <div className={styles.text}>{props.children}</div>
      <div className={iconClass}>
        <svg width='15' height='10' viewBox='0 0 15 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M13 1H2C1.44772 1 1 1.44772 1 2V8C1 8.55229 1.44772 9 2 9H13C13.5523 9 14 8.55228 14 8V2C14 1.44772 13.5523 1 13 1ZM2 0C0.895431 0 0 0.89543 0 2V8C0 9.10457 0.89543 10 2 10H13C14.1046 10 15 9.10457 15 8V2C15 0.895431 14.1046 0 13 0H2Z'
            fill='var(--gray-light)'
          />
          <path
            d='M4.38423 5.76705V5.14205H9.42401C9.65507 5.14205 9.86529 5.08523 10.0547 4.97159C10.246 4.85795 10.3975 4.70549 10.5092 4.5142C10.6229 4.32292 10.6797 4.11174 10.6797 3.88068C10.6797 3.64962 10.6229 3.43939 10.5092 3.25C10.3956 3.06061 10.2441 2.90909 10.0547 2.79545C9.86529 2.68182 9.65507 2.625 9.42401 2.625H9.13423V2H9.42401C9.7706 2 10.0859 2.08523 10.37 2.25568C10.6541 2.42424 10.8804 2.65057 11.049 2.93466C11.2195 3.21875 11.3047 3.53409 11.3047 3.88068C11.3047 4.14015 11.2554 4.38447 11.157 4.61364C11.0604 4.84091 10.9259 5.04167 10.7536 5.21591C10.5812 5.38826 10.3814 5.52367 10.1541 5.62216C9.92685 5.71875 9.68348 5.76705 9.42401 5.76705H4.38423ZM6.26491 8L3.71946 5.45455L6.26491 2.90909L6.69957 3.34375L4.58594 5.45455L6.69957 7.56534L6.26491 8Z'
            fill='var(--gray-light)'
          />
        </svg>
      </div>
    </div>
  );
};
