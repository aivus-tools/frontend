import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface SelectProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	options: string[];
	onAdd: (newOption: string) => void;
}
