'use client';

import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { RowLine } from '../RowLine';
import { ArrowButton } from '../Title/ArrowButton';
import { Flex } from 'antd';

import styles from './title.module.css';

interface SubTitleProps {
  text: string;
  itemKey: string;
  value: string;
  clientValue: string;
}

export const SubTitle = (props: SubTitleProps) => {
  const { keys, switchKey } = useExpandedKeys();
  const isOpen = !!keys?.includes(props.itemKey);
  const handleClick = () => switchKey(props.itemKey);

  return (
    <>
      <div style={{ backgroundColor: 'var(--white)' }} />
      <div className={styles.sectionSubTitle} style={{ gridColumn: isOpen ? 'span 6' : 'span 4' }}>
        <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
          <ArrowButton isOpen={isOpen} />
          <div className={styles.sectionSubTitleText}>{props.text}</div>
        </Flex>
      </div>
      {!isOpen && (
        <>
          <div className={styles.sectionSubTitleSumHeader}>{props.value}</div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
        </>
      )}
      <div />
      {!isOpen ? (
        <>
          <div className={styles.sectionSubTitleSumHeader} style={{ gridColumn: 'span 4' }}>
            {props.clientValue}
          </div>
          <div style={{ backgroundColor: 'var(--white)' }} />
        </>
      ) : (
        <div className={styles.sectionSubTitle} style={{ gridColumn: 'span 5' }} />
      )}
      <RowLine />
    </>
  );
};
