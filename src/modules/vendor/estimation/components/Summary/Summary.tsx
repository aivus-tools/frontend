'use client';

import { UnforeseenExpenses } from './UnforeseenExpenses';
import { GrandTotal } from './GrandTotal';
import { SubtotalAllSections } from './SubtotalAllSections';
import { CategoryFeesTotal } from './CategoryFeesTotal';

export const Summary = () => {
  return (
    <>
      <SubtotalAllSections />
      <CategoryFeesTotal />
      <UnforeseenExpenses />
      <GrandTotal />
    </>
  );
};
