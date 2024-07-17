import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { tSection } from '@/app/interfaces/app.interface';

export interface EstTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: tSection[],
}
