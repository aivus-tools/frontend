import { DetailedHTMLProps, InputHTMLAttributes, ChangeEventHandler } from 'react';

export interface EditableInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
	value: number | string;
	type?: 'number' | 'text';
	isPrice?: boolean;
	disabled?: boolean;
	onChange?: ChangeEventHandler<HTMLInputElement>;
}
