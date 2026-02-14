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

export const round = (x: number) => Math.round(x * 100) / 100;

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
  return formatter.format(value);
};
