import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface PrStatusProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	status: 'RFP' | 'Reviewing' | 'Ongoing';
}
