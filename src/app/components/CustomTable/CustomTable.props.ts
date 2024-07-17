import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { tSection } from '@/app/interfaces/app.interface';

export interface CustomTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: tSection[],
}
