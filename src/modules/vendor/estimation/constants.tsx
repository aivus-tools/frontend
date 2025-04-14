import SettingsIcon from '@/icons/settings-icon.svg';
import type { Headers } from './types';
import { percentFormat, percentParser, priceFormat, priceParser } from './helpers/format';

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
		itemProps: {
			formatter: priceFormat,
			parser: priceParser,
		},
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
		itemProps: {
			formatter: priceFormat,
			parser: priceParser,
		},
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
		itemProps: {
			formatter: percentFormat,
			parser: percentParser,
		},
	},
	{
		label: "Client's price",
		key: 'clientPrice',
		itemProps: {
			formatter: priceFormat,
			parser: priceParser,
		},
	},
	{
		label: "Client's cost",
		key: 'clientCost',
		itemProps: {
			formatter: priceFormat,
			parser: priceParser,
		},
		itemStyle: {
			paddingRight: '4px',
		},
	},
	{
		label: '',
		key: 'marketRange',
	},
];
