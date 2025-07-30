import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface SettingsItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title: string;
  children: ReactNode;
}
