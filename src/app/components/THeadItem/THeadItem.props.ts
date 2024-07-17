import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface THeadItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	text: string;
	showIcon?: boolean;
}
