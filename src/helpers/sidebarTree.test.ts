import { describe, it, expect } from 'vitest';
import { createSidebarTree } from './sidebarTree';
import { TSection } from '@/types/app.interface';

describe('createSidebarTree', () => {
  it('returns empty array for empty input', () => {
    expect(createSidebarTree([])).toEqual([]);
  });

  it('creates section item from flat section with rows', () => {
    const sections: TSection[] = [
      {
        id: 's1',
        title: 'Production',
        isHidden: false,
        rows: [
          { id: 'r1', item: 'Camera', price: 100, units: 'Day', quantity: 1, surcharge: 0, cprice: 100, range: 0 },
        ],
      },
    ];
    const result = createSidebarTree(sections);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('s1');
    expect(result[0].title).toBe('Production');
    expect(result[0].type).toBe('section');
    expect(result[0].isHidden).toBe(false);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0]).toEqual({
      id: 'r1',
      title: 'Camera',
      isHidden: false,
      type: 'row',
    });
  });

  it('creates section with subsections', () => {
    const sections: TSection[] = [
      {
        id: 's1',
        title: 'Production',
        isHidden: false,
        subSections: [
          {
            id: 'sub1',
            title: 'Crew',
            isHidden: true,
            rows: [
              {
                id: 'r1',
                item: 'Director',
                price: 500,
                units: 'Day',
                quantity: 1,
                surcharge: 0,
                cprice: 500,
                range: 0,
              },
              { id: 'r2', item: 'Gaffer', price: 300, units: 'Day', quantity: 1, surcharge: 0, cprice: 300, range: 0 },
            ],
          },
        ],
      },
    ];
    const result = createSidebarTree(sections);
    expect(result[0].children).toHaveLength(1);
    const sub = result[0].children![0];
    expect(sub.id).toBe('sub1');
    expect(sub.title).toBe('Crew');
    expect(sub.type).toBe('subsection');
    expect(sub.isHidden).toBe(true);
    expect(sub.children).toHaveLength(2);
    expect(sub.children![0].title).toBe('Director');
    expect(sub.children![1].title).toBe('Gaffer');
  });

  it('prefers subSections over rows when both exist', () => {
    const sections: TSection[] = [
      {
        id: 's1',
        title: 'Mixed',
        isHidden: false,
        subSections: [{ id: 'sub1', title: 'Sub', isHidden: false, rows: [] }],
        rows: [{ id: 'r1', item: 'Row', price: 0, units: '', quantity: 0, surcharge: 0, cprice: 0, range: 0 }],
      },
    ];
    const result = createSidebarTree(sections);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].type).toBe('subsection');
  });

  it('section without subSections or rows has empty children', () => {
    const sections: TSection[] = [{ id: 's1', title: 'Empty', isHidden: false }];
    const result = createSidebarTree(sections);
    expect(result[0].children).toEqual([]);
  });

  it('handles multiple sections', () => {
    const sections: TSection[] = [
      { id: 's1', title: 'A', isHidden: false },
      { id: 's2', title: 'B', isHidden: true },
    ];
    const result = createSidebarTree(sections);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
    expect(result[1].title).toBe('B');
    expect(result[1].isHidden).toBe(true);
  });

  it('row children always have isHidden false', () => {
    const sections: TSection[] = [
      {
        id: 's1',
        title: 'S',
        isHidden: false,
        rows: [{ id: 'r1', item: 'Row1', price: 0, units: '', quantity: 0, surcharge: 0, cprice: 0, range: 0 }],
      },
    ];
    const result = createSidebarTree(sections);
    expect(result[0].children![0].isHidden).toBe(false);
  });
});
