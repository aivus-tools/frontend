'use client';

import { UnforeseenExpenses } from './UnforeseenExpenses';
import { GrandTotal } from './GrandTotal';
import { CostPerVideo } from './CostPerVideo';
import { SubtotalAllSections } from './SubtotalAllSections';

interface SummaryProps {
  clientView?: boolean;
}

export const Summary = ({ clientView = false }: SummaryProps) => {
  return (
    <>
      <SubtotalAllSections />
      <UnforeseenExpenses />
      <GrandTotal />
      {/* <CostPerVideo /> */}
    </>
  );
};
