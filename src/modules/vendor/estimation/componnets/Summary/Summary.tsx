'use client';

import { UnforeseenExpenses } from './UnforeseenExpenses';
import { GrandTotal } from './GrandTotal';
import { SubtotalAllSections } from './SubtotalAllSections';

export const Summary = () => {
  return (
    <>
      <SubtotalAllSections />
      <UnforeseenExpenses />
      <GrandTotal />
      {/* <CostPerVideo /> */}
    </>
  );
};
