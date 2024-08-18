import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { Project } from '@/app/interfaces/app.interface';

export interface ProjectItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	item: Project;
}
