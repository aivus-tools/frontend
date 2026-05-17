'use client';

import type { Category } from '@/types/estimation.interface';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { useCallback } from 'react';
import { Flex } from 'antd';
import { RowLine } from '../RowLine';
import { LinkButton } from '../LinkButtons/LinkButtons';
import { ArrowButton } from '../Title/ArrowButton';
import { selectCategorySurcharge } from '@/store/slices/offer/selectors';
import { changeCategorySurcharge } from '@/store/slices/offer/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { InputNumberRight } from '../InputNumberRight';
import { percentFormat, percentParser } from '@/modules/vendor/estimation/helpers/format';

import styles from './title.module.css';

interface TitleProps {
  category: Category;
  itemKey: string;
  value: string;
  clientValue: string;
}

export const Title = (props: TitleProps) => {
  const dispatch = useAppDispatch();
  const { keys, switchKey } = useExpandedKeys();
  const isOpen = !!keys?.includes(props.itemKey);
  const { linked, surcharge } = useAppSelector(
    useCallback((state: RootState) => selectCategorySurcharge(state, props.category.id), [props.category.id])
  );

  const handleLink = () => {
    dispatch(changeCategorySurcharge({ categoryId: props.category.id, linked: !linked }));
  };
  const handleSurcharge = (value: number | null) => {
    if (value !== null) {
      dispatch(changeCategorySurcharge({ categoryId: props.category.id, surcharge: value }));
    }
  };
  const handleClick = () => switchKey(props.itemKey);

  const sectionTitleClass = isOpen ? `${styles.sectionTitle} ${styles.sectionTitleOpen}` : styles.sectionTitle;

  return (
    <>
      <div className={sectionTitleClass} style={{ gridColumn: isOpen ? 'span 7' : 'span 5' }}>
        <Flex align='center' onClick={handleClick} style={{ cursor: 'pointer' }}>
          <ArrowButton isOpen={isOpen} />
          <div className={styles.sectionTitleText}>{props.category.name}</div>
        </Flex>
      </div>
      {!isOpen && (
        <>
          <div className={styles.sectionTitleSumHeader}>{props.value}</div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
        </>
      )}
      <div />
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--white)', borderRadius: isOpen ? '6px 0 0 0' : '6px 0 0 6px' }}
      >
        <LinkButton link={linked} onClickAction={handleLink} />
      </Flex>
      <Flex align='center' justify='center' style={{ backgroundColor: 'var(--white)', padding: '2px' }}>
        <InputNumberRight
          onChange={handleSurcharge}
          controls={false}
          value={surcharge}
          formatter={percentFormat}
          parser={percentParser}
        />
      </Flex>
      {isOpen ? (
        <div className={styles.sectionTitle} style={{ gridColumn: 'span 3', borderRadius: '0 6px 0 0' }} />
      ) : (
        <>
          <div className={styles.sectionTitleSumHeader} style={{ gridColumn: 'span 2', justifyContent: 'flex-end' }}>
            {props.clientValue}
          </div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '0 6px 6px 0' }} />
        </>
      )}
      {isOpen && <RowLine />}
    </>
  );
};
