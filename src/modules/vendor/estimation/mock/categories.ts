import { Category } from '@/types/categories.interface';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Creative Development',
    level: 1,
  },
  {
    id: '2',
    name: '1. Pre-Production',
    level: 1,
  },
  {
    id: '3',
    name: '2. Production',
    level: 1,
  },
  {
    id: '4',
    name: '1. Equipment',
    level: 2,
    parentCategoryId: '3',
  },
  {
    id: '5',
    name: '2. Crew Fees',
    level: 2,
    parentCategoryId: '3',
  },
  {
    id: '6',
    name: '3. Additional Expenses & Expedition',
    level: 2,
    parentCategoryId: '3',
  },
  {
    id: '7',
    name: '3. Post-Production & Graphics',
    level: 1,
  },
  {
    id: '8',
    name: 'Fees',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '9',
    name: 'Editing',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '10',
    name: 'Graphics & Animation',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '11',
    name: 'Sound & Music',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '12',
    name: 'Miscellaneous',
    level: 2,
    parentCategoryId: '7',
  },
];
