import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface SelectProps
	extends Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'> {
	options: string[];
	value?: string;
	onAdd: (newOption: string) => void;
	onChange?: (selectedOption: string) => void;
}
