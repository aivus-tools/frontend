// import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
//
// export interface AccordionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
// 	title: ReactNode | string;
// 	onToggle?: (isOpen: boolean) => void;
// 	children: ReactNode;
// }

import { HTMLAttributes } from 'react';
import { SubSection } from '@/app/interfaces/app.interface';

export interface MultipleAccordionProps {
	title: React.ReactNode;
	content?: React.ReactNode;
	subSections: { subTitle: React.ReactNode; subContent: React.ReactNode; isOpen: boolean; onToggle: (isOpen: boolean) => void }[];
	isOpen: boolean;
	onToggle: (isOpen: boolean) => void;
	className?: string;
}
