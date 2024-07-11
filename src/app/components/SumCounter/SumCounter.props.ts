import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface SumCounterProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	title: string;
	count: number;
	highlight?: boolean;
	children?: ReactNode;
}
