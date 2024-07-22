// import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
//
// export interface AccordionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
// 	title: ReactNode | string;
// 	onToggle?: (isOpen: boolean) => void;
// 	children: ReactNode;
// }

import { HTMLAttributes } from 'react';
import { SubSection } from '@/app/interfaces/app.interface';

export interface MultipleAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
	title: React.ReactNode;
	content?: React.ReactNode;
	subSections?: SubSection[];
}
