'use client';

import React from 'react';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { Flex } from 'antd';
import { ArrowButton } from '@/modules/vendor/estimation/components/Title/ArrowButton';

import styles from '../components.module.css';

interface SubTitleProps {
  text: string;
  itemKey: string;
  value: string;
}

export const SubTitle = (props: SubTitleProps) => {
  const { keys, switchKey } = useExpandedKeys();
  const isOpen = !!keys?.includes(props.itemKey);
  const handleClick = () => switchKey(props.itemKey);

  return (
    <>
      <div style={{ backgroundColor: 'var(--white)' }} />
      <div className={styles.sectionSubTitle} style={{ gridColumn: isOpen ? 'span 4' : 'span 1' }}>
        <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
          <ArrowButton isOpen={isOpen} />
          <div className={styles.sectionSubTitleText}>{props.text}</div>
        </Flex>
      </div>
      {!isOpen && (
        <>
          <div style={{ backgroundColor: 'var(--white)' }} />
          <div style={{ backgroundColor: 'var(--white)' }} />
          <div style={{ backgroundColor: 'var(--white)' }} />
          <div className={styles.sectionSubTitleSumHeader} style={{ backgroundColor: 'var(--white)', paddingRight: 2 }}>
            {props.value}
          </div>
          <div style={{ backgroundColor: 'var(--white)' }} />
        </>
      )}
      {isOpen && (
        <>
          <div style={{ backgroundColor: 'var(--white)' }} />
          <div style={{ backgroundColor: 'var(--white)' }} />
        </>
      )}
      {isOpen && (
        <>
          <div style={{ backgroundColor: 'var(--white)' }} />
          <div className={styles.rowLine} />
          <div style={{ backgroundColor: 'var(--white)' }} />
        </>
      )}
    </>
  );
};
