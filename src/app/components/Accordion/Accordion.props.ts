import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface AccordionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	title: ReactNode | string;
	onToggle?: (isOpen: boolean) => void;
	children: ReactNode;

}
