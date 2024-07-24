import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface SumProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	count: number;
	size?: 'xs' | 's' | 'm' | 'l';
	type?: 'green' | 'blue' | 'gray' | 'dark';
}
