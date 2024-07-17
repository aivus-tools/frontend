import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface LinkedPercentProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	count: number;
	highlight?: boolean;
	linked?: boolean;
	disabled?: boolean;
}
