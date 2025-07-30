import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface SideModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
