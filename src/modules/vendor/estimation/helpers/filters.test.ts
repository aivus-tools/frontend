import { describe, it, expect } from 'vitest';
import { filterOptionsById, filterOptionsBySetOfId } from './filters';

interface FakeOption {
  categoryId: string;
  name: string;
}

const options: FakeOption[] = [
  { categoryId: 'cat-1', name: 'Camera' },
  { categoryId: 'cat-1', name: 'Lens' },
  { categoryId: 'cat-2', name: 'Sound' },
  { categoryId: 'cat-3', name: 'Lighting' },
];

describe('filterOptionsById', () => {
  it('filters by category id when no search value', () => {
    const filter = filterOptionsById('cat-1');
    const result = filter(options as never[], '');
    expect(result).toHaveLength(2);
    expect((result as FakeOption[]).every((x) => x.categoryId === 'cat-1')).toBe(true);
  });

  it('returns all options when search value is present', () => {
    const filter = filterOptionsById('cat-1');
    const result = filter(options as never[], 'Sound');
    expect(result).toHaveLength(4);
  });

  it('returns all options when no id provided', () => {
    const filter = filterOptionsById(undefined);
    const result = filter(options as never[], '');
    expect(result).toHaveLength(4);
  });
});

describe('filterOptionsBySetOfId', () => {
  it('filters by set of category ids when no search value', () => {
    const filter = filterOptionsBySetOfId(new Set(['cat-1', 'cat-3']));
    const result = filter(options as never[], '');
    expect(result).toHaveLength(3);
  });

  it('returns all options when search value is present', () => {
    const filter = filterOptionsBySetOfId(new Set(['cat-1']));
    const result = filter(options as never[], 'query');
    expect(result).toHaveLength(4);
  });

  it('returns all options when no set provided', () => {
    const filter = filterOptionsBySetOfId(undefined);
    const result = filter(options as never[], '');
    expect(result).toHaveLength(4);
  });
});
