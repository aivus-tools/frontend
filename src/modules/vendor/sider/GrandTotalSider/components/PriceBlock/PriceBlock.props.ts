import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface PriceBlockProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title: string;
  amount: number;
  highlight?: boolean;
  percentDiff?: number | null;
  percentPositive?: boolean; // true if positive trend
  children?: ReactNode;
}
