import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface AddItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  text: string;
}
