import { Category } from '@/types/categories.interface';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Креативная разработка',
    level: 1,
  },
  {
    id: '2',
    name: '1. Пре-продакшн',
    level: 1,
  },
  {
    id: '3',
    name: '2. Продакшн',
    level: 1,
  },
  {
    id: '4',
    name: '1.  Оборудование',
    level: 2,
    parentCategoryId: '3',
  },
  {
    id: '5',
    name: '2.  Гонорары',
    level: 2,
    parentCategoryId: '3',
  },
  {
    id: '6',
    name: '3. Дополнительные расходы и экспедиция',
    level: 2,
    parentCategoryId: '3',
  },
  {
    id: '7',
    name: '3. Пост-продакшн и графика',
    level: 1,
  },
  {
    id: '8',
    name: 'Гонорары',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '9',
    name: 'Монтаж',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '10',
    name: 'Графика и анимация',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '11',
    name: 'Звук и музыка',
    level: 2,
    parentCategoryId: '7',
  },
  {
    id: '12',
    name: 'Разное',
    level: 2,
    parentCategoryId: '7',
  },
];
