import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { SidebarItem } from '@/interfaces/app.interface';

export interface SidebarNavSectionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	section: SidebarItem;
}
