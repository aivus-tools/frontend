import SettingsIcon from '@/icons/settings-icon.svg';
import type { Headers } from './types';
import { percentFormat, percentParser, priceFormat, priceParser } from './helpers/format';
import { t } from '@/lib/i18n';

export const HEADERS: Headers[] = [
  {
    label: <SettingsIcon />,
    key: 'settings',
  },
  {
    label: t('ITEM'),
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
    label: t('PRICE'),
    key: 'price',
    itemProps: {
      formatter: priceFormat,
      parser: priceParser,
    },
  },
  {
    label: t('UNITS'),
    key: 'units',
  },
  {
    label: t('QUANTITY'),
    key: 'quantity',
  },
  {
    label: t('COST'),
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
    label: t('SURCHARGE'),
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
    label: t('CLIENTS_PRICE'),
    key: 'clientPrice',
    itemProps: {
      formatter: priceFormat,
      parser: priceParser,
    },
  },
  {
    label: t('CLIENTS_COST'),
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
