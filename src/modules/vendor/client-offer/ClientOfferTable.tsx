'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectRootCategories } from '@/store/slices/offer/selectors';
import { KeysProvider } from '../estimation/context/expanded';
import { Category } from './components/Category';
import { Table, Wrapper } from '../estimation/styled';
import { Header } from './components/Header';
import { GrandTotal } from './components/GrandTotal';
import { useLoadData } from '../estimation/hooks/useLoadData';
import Spinner from '@/components/Spinner';

export function ClientOfferTable() {
  const categories = useAppSelector(selectRootCategories);
  const isLoading = useLoadData();

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <KeysProvider>
      <Wrapper>
        <Table>
          <Header />
          {categories.map((category) => (
            <Category key={category.id} category={category} />
          ))}
          <GrandTotal />
        </Table>
      </Wrapper>
    </KeysProvider>
  );
}
