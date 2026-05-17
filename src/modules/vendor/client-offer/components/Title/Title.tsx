'use client';

import React from 'react';
import type { Category } from '@/types/estimation.interface';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { Flex } from 'antd';
import { ArrowButton } from '@/modules/vendor/estimation/components/Title/ArrowButton';

import styles from '../components.module.css';

interface TitleProps {
  category: Category;
  itemKey: string;
  value: string;
}

export const Title = (props: TitleProps) => {
  const { keys, switchKey } = useExpandedKeys();
  const isOpen = !!keys?.includes(props.itemKey);
  const handleClick = () => switchKey(props.itemKey);

  return (
    <>
      <div className={styles.sectionTitle} style={{ gridColumn: isOpen ? 'span 5' : 'span 2' }}>
        <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
          <ArrowButton isOpen={isOpen} />
          <div className={styles.sectionTitleText}>{props.category.name}</div>
        </Flex>
      </div>
      {!isOpen && (
        <>
          <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
          <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
          <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
          <div
            className={styles.sectionTitleSumHeader}
            style={{
              backgroundColor: 'var(--bg-blue-subsection)',
              justifyContent: 'flex-end',
              paddingRight: 10,
            }}
          >
            {props.value}
          </div>
          <div style={{ backgroundColor: 'var(--bg-blue-subsection)', borderRadius: '0 6px 6px 0' }} />
        </>
      )}
      {isOpen && (
        <>
          <div className={styles.sectionTitle} />
          <div className={styles.sectionTitle} style={{ borderRadius: '0 6px 0 0' }} />
        </>
      )}
      {isOpen && (
        <>
          <div style={{ backgroundColor: 'var(--bg-blue-subsection)' }} />
          <div className={`${styles.rowLine} ${styles.rowLineDark}`} />
          <div style={{ backgroundColor: 'var(--white)' }} />
        </>
      )}
    </>
  );
};
