'use client';

import { InputNumber } from 'antd';
import { cloneElement, ComponentProps, useMemo, useState } from 'react';

import styles from '../estimation.module.css';

export const InputNumberRight = ((props: ComponentProps<typeof InputNumber> = {}) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const handlers = useMemo(() => {
    return {
      variant: focused || hovered ? ('outlined' as const) : ('borderless' as const),
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    };
  }, [focused, hovered]);

  return cloneElement(<InputNumber className={styles.inputNumberRight} />, { ...handlers, ...props });
}) as typeof InputNumber;
