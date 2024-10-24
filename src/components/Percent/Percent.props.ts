import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface PercentProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	mark: 'average' | 'below' | 'above' | 'na';
	count: number;
	size?: 's' | 'm' | 'l';
	rounded?: boolean;
	type?: 'filled' | 'transparent' | 'inversion';
}
