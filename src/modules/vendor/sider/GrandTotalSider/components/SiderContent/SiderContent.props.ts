import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface SiderContentProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
