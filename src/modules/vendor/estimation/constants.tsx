import SettingsIcon from '@/icons/settings-icon.svg';
import type { Headers } from './types';

export const HEADERS: Headers[] = [
	{
		label: <SettingsIcon />,
		key: 'settings',
	},
	{
		label: 'Item',
		style: {
			textAlign: 'left',
			paddingLeft: '8px',
		},
		itemStyle: {
			textAlign: 'left',
			paddingLeft: '32px',
		},
		key: 'item',
	},
	{
		label: 'Price, $',
		key: 'price',
	},
	{
		label: 'Units',
		key: 'units',
	},
	{
		label: 'Quantity',
		key: 'quantity',
	},
	{
		label: 'Cost, $',
		key: 'cost',
	},
	{
		label: '',
		key: 'actions',
	},
];

export const CLIENTS_HEADERS: Headers[] = [
	{
		label: '',
		key: 'link',
	},
	{
		label: 'Surcharge',
		key: 'surcharge',
		itemStyle: {
			color: 'var(--gray-light)',
		},
	},
	{
		label: "Client's price",
		key: 'clientPrice',
	},
	{
		label: "Client's cost",
		key: 'clientCost',
	},
	{
		label: 'Market Range',
		key: 'marketRange',
	},
];
