import { THead } from '@/types/app.interface';
import { t } from '@/lib/i18n';

export const contentTHeads: THead[] = [
  {
    text: 'Item',
    // showIcon: true,
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
];
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
];

export const dashboardTHeads: THead[] = [
  {
    text: t('DASHBOARD_PROJECT'),
    showIcon: true,
  },
  {
    text: t('DASHBOARD_CLIENT'),
  },
  {
    text: t('DASHBOARD_STATUS'),
  },
  {
    text: t('DASHBOARD_COST_EXPENSES'),
    className: 'alignRight',
  },
  {
    text: t('DASHBOARD_PROFIT'),
    className: 'alignRight',
  },
  {
    text: t('DASHBOARD_DEADLINE'),
  },
  {
    text: t('DASHBOARD_CREATED'),
  },
];

export const unitsOptions: string[] = ['Units', 'Pack', 'Piece', 'Box', 'Bag', 'Dozen', 'Roll'];
