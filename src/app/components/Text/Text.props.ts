import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface TextProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	color?: 'gray' | 'grayLight' | 'grayDark' | 'primary' | 'red';
	size?: 'xs' | 's' | 'm' | 'l' | 'xl';
	weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'exrtabold' | 'black';
	children: ReactNode;
}
