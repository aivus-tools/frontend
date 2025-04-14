export const timeUnitsMap = [
	{ singular: 'month', plural: 'months' },
	{ singular: 'year', plural: 'years' },
	{ singular: 'day', plural: 'days' },
	{ singular: 'second', plural: 'seconds' },
	{ singular: 'minute', plural: 'minutes' },
	{ singular: 'hour', plural: 'hours' },
];

export const applyPercentage = (value: number, percent: number): number => {
	return value * (percent / 100);
};

const formatter = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
	return formatter.format(value);
};
