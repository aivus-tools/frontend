import { THead } from '@/app/interfaces/app.interface';

export const contentTHeads: THead[] = [
	{
		text: 'Item',
		showIcon: true,
	},
	{
		text: 'Price, $',
		// className: 'alignRight',
	},
	{
		text: 'Units',
		// className: 'alignRight',
	},
	{
		text: 'Quantity',
		// className: 'alignRight',
	},
	{
		text: 'Cost, $',
		className: 'alignRight',
	},
]
export const asideTHeads: THead[] = [
	{
		text: 'Surcharge',
		showIcon: true,
	},
	{
		text: 'Client’s price',
	},
	{
		text: 'Client’s cost',
		className: 'alignRight',
	},
	{
		text: 'Market Range',
	},
]


export const unitsOptions: string[] = [
	'Units',
	'Pack',
	'Piece',
	'Box',
	'Bag',
	'Dozen',
	'Roll'
]
