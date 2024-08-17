import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface SettingsItemTitleProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	title: string;
	subTitle: string;
}
