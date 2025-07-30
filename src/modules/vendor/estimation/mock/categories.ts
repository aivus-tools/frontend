import { Category } from '@/types/categories.interface';

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Креативная разработка',
  },
  {
    id: 2,
    name: '1. Пре-продакшн',
  },
  {
    id: 3,
    name: '2. Продакшн',
  },
  {
    id: 4,
    name: '1.  Оборудование',
    parentCategoryId: 3,
  },
  {
    id: 5,
    name: '2.  Гонорары',
    parentCategoryId: 3,
  },
  {
    id: 6,
    name: '3. Дополнительные расходы и экспедиция',
    parentCategoryId: 3,
  },
  {
    id: 7,
    name: '3. Пост-продакшн и графика',
  },
  {
    id: 8,
    name: 'Гонорары',
    parentCategoryId: 7,
  },
  {
    id: 9,
    name: 'Монтаж',
    parentCategoryId: 7,
  },
  {
    id: 10,
    name: 'Графика и анимация',
    parentCategoryId: 7,
  },
  {
    id: 11,
    name: 'Звук и музыка',
    parentCategoryId: 7,
  },
  {
    id: 12,
    name: 'Разное',
    parentCategoryId: 7,
  },
];
