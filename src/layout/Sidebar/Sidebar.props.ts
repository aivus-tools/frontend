import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface SidebarProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	theme?: 'light' | 'dark';
	sidebarContent?: ReactNode;
}
