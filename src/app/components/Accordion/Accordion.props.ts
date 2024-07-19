// import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
//
// export interface AccordionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
// 	title: ReactNode | string;
// 	onToggle?: (isOpen: boolean) => void;
// 	children: ReactNode;
// }

import { ReactNode, HTMLAttributes } from 'react';

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
	title: ReactNode;
	onAccToggle?: (isOpen: boolean) => void;
	children: ReactNode;
}
