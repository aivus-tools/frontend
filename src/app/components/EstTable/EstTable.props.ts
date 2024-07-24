import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { TRow, tSection, tSubSection } from '@/app/interfaces/app.interface';

export interface EstTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: tSection[],
	onRemoveItem: (row: TRow) => void;
	onAddItem: (sectionId: number, isSubSection: boolean) => void;
	onAddSection: () => void;
	onChangeInput: (sectionId: number, rowId: number, field: string, value: string | number) => void;
}

