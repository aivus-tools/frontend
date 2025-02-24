import { MenuProps } from 'antd';
import { Entry } from './types';

export const mapEntriesToDropdownItems = (entries: Entry[]): MenuProps['items'] => {
	return entries.map((entry) => ({
		key: `${entry.id}`,
		label: entry.name,
		children: entry.variants?.map((variant) => ({
			key: `${entry.id}-${variant.id}`,
			label: variant.label,
		})),
	}));
};
